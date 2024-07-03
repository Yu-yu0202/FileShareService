require('dotenv').config();

const morgan = require('morgan');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const mime = require('mime-types');
const helmet = require('helmet');
const https = require('https');

const app = express();
app.use(express.static('public'));
const isDevelopment = process.env.NODE_ENV === 'development';
app.use(helmet());


app.use(express.static(path.join(__dirname, 'src'), {
	// フォルダのパターンを除外
	setHeaders: (res, path, stat) => {
		if (path.includes('SSL-CERTIFICATE')) {
			// SSL-CERTIFICATEフォルダ内のファイルにはアクセスを許可しない
			res.status(403).send('Access Forbidden');
		}
	}
}));

// セッションのシークレットキーの生成
const secretKey = crypto.randomBytes(64).toString('hex');

// SQLite3データベースの設定
const dbPath = path.resolve(__dirname, 'users.db');
const db = new sqlite3.Database(dbPath);

// 環境変数から管理者パスワードを取得
const adminPassword = process.env.ADMIN_PW;
if (!adminPassword) {
	console.error('環境変数 ADMIN_PW が設定されていません。');
	process.exit(1); // プロセスを終了してエラーメッセージを出力
}

// テーブルの作成
db.serialize(() => {
	db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT UNIQUE, password TEXT, role TEXT)");
	db.run("CREATE TABLE IF NOT EXISTS files (id INTEGER PRIMARY KEY, originalName TEXT, storedName TEXT, uploadDate TEXT, userId INTEGER, isVisible INTEGER DEFAULT 1)"); // isVisible列を追加

	// 管理者ユーザーの追加
	const adminPasswordHash = bcrypt.hashSync(adminPassword, 10);
	db.run(`INSERT OR IGNORE INTO users (username, password, role) VALUES ('admin', ?, 'admin')`, [adminPasswordHash]);
});

// セッションの設定
app.use(session({
	secret: secretKey,
	resave: false,
	saveUninitialized: false
}));

// ミドルウェアの設定
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

if (isDevelopment) {
	app.use(morgan('dev'));
}

// レスポンスのContent-Typeを設定するミドルウェア
app.use((req, res, next) => {
	res.header("Content-Type", "text/html; charset=utf-8");
	next();
});

//キャッシュの設定
app.use((req, res, next) => {
	res.set('Cache-Control', 'no-store');
	next();
});
app.use((req, res, next) => {
	// キャッシュを無効化するヘッダーを設定
	res.header('Cache-Control', 'no-store, no-cache, must-revalidate, private');
	res.header('Pragma', 'no-cache');
	res.header('Expires', '0');
	next();
});

//favicon.icoの設定
app.get('/favicon.ico', (req, res) => {
	res.sendFile(path.join(__dirname, 'src', "favicon.ico"));
})

// ファイルアップロード設定
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
	fs.mkdirSync(uploadDir);
}

const MAX_FILE_SIZE = 1 * 1024 * 1024 * 1024; // 1GB
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, uploadDir);
	},
	filename: (req, file, cb) => {
		const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
		cb(null, uniqueName);
	}
});
const upload = multer({
	storage: storage,
	limits: { fileSize: MAX_FILE_SIZE }
});

// 静的ファイルの提供
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ログインページ
app.get('/login', (req, res) => {
	res.sendFile(path.join(__dirname, 'src', 'login.html'));
});

// ログイン処理
app.post('/login', (req, res) => {
	const { username, password } = req.body;
	db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, user) => {
		if (err || !user) {
			console.error('ユーザーが見つかりません:', username);
			return res.status(401).send('ユーザーが見つかりません');
		}

		bcrypt.compare(password, user.password, (err, result) => {
			if (result) {
				req.session.loggedIn = true;
				req.session.user = { username: user.username, role: user.role, id: user.id };
				const redirectTo = req.query.redirect_to || '/dashboard';
				res.setHeader('Content-Type', 'application/json; charset=utf-8');
				res.status(200).json({ message: 'OK', redirectTo });
			} else {
				console.error('パスワードが間違っています:', username);
				res.status(401).send('パスワードが間違っています');
			}
		});
	});
});

// ログインが必要なページにリダイレクト処理を追加するミドルウェア
function requireLogin(req, res, next) {
	if (req.session.loggedIn) {
		next();
	} else {
		const redirectTo = `/login?redirect_to=${encodeURIComponent(req.originalUrl)}`;
		res.redirect(redirectTo);
	}
}

// ダッシュボードページ（ログインが必要）
app.get('/dashboard', requireLogin, (req, res) => {
	res.sendFile(path.join(__dirname, 'src', 'dashboard.html'));
});

// 管理者のみアクセス可能なミドルウェア
function adminOnly(req, res, next) {
	if (req.session.loggedIn && req.session.user.role === 'admin') {
		next();
	} else if (!req.session.loggedIn) {
		res.status(401).send('ログインが必要です');
	} else {
		res.status(403).send('管理者のみアクセス可能です');
	}
}

// ユーザー登録ページ（管理者のみ）
app.get('/register', adminOnly, (req, res) => {
	res.sendFile(path.join(__dirname, 'src', 'register.html'));
});

// ユーザー登録処理（管理者のみ）
app.post('/register', adminOnly, (req, res) => {
	const { username, password } = req.body;
	const passwordHash = bcrypt.hashSync(password, 10);
	db.run(`INSERT INTO users (username, password, role) VALUES (?, ?, 'user')`, [username, passwordHash], (err) => {
		if (err) {
			if (err.code === 'SQLITE_CONSTRAINT') {
				res.status(409).send('ユーザー名は既に使用されています');
			} else {
				res.status(500).send('ユーザー登録に失敗しました');
			}
		} else {
			res.send('ユーザー登録に成功しました');
		}
	});
});

// ファイルアップロード処理
app.post('/upload', requireLogin, upload.single('file'), (req, res) => {
	if (!req.file) {
		return res.status(400).send('ファイルが空です');
	}
	const { originalname, filename } = req.file;
	const uploadDate = new Date().toISOString();

	db.run(`INSERT INTO files (originalName, storedName, uploadDate, userId) VALUES (?, ?, ?, ?)`,
		[originalname, filename, uploadDate, req.session.user.id],
		(err) => {
			if (err) {
				return res.status(500).send('ファイル情報の保存に失敗しました');
			}
			res.status(200).send('ファイルのアップロードに成功しました');
		}
	);
});

// ファイルリストページ（すべての登録ユーザーが閲覧可能）
app.get('/files', requireLogin, (req, res) => {
	db.all(`SELECT id, originalName AS name, uploadDate FROM files`, (err, rows) => {
		if (err) {
			return res.status(500).send('ファイル情報の取得に失敗しました');
		}
		res.json(rows);
	});
});

// ファイルの可視性を更新
app.put('/update-visibility/:id', adminOnly, (req, res) => {
	const fileId = req.params.id;
	const { visible } = req.body;

	db.run(`UPDATE files SET isVisible = ? WHERE id = ?`, [visible, fileId], function (err) {
		if (err) {
			return res.status(500).send('ファイルの可視性の更新に失敗しました');
		}
		res.send('ファイルの可視性が更新されました');
	});
});

// ファイルの削除
app.delete('/delete-file/:id', adminOnly, (req, res) => {
	const fileId = req.params.id;

	db.get(`SELECT storedName FROM files WHERE id = ?`, [fileId], (err, row) => {
		if (err || !row) {
			return res.status(404).send('ファイルが見つかりません');
		}

		const filePath = path.join(__dirname, 'uploads', row.storedName);

		db.run(`DELETE FROM files WHERE id = ?`, [fileId], function (err) {
			if (err) {
				return res.status(500).send('ファイルの削除に失敗しました');
			}

			fs.unlink(filePath, (err) => {
				if (err) {
					console.error('ファイルの削除に失敗しました', err);
				}
			});

			res.send('ファイルが削除されました');
		});
	});
});

// ファイル管理ページ
app.get('/manage-files', adminOnly, (req, res) => {
	res.sendFile(path.join(__dirname, 'src', 'manage_files.html'));
});

// ログアウト処理
app.get('/logout', (req, res) => {
	req.session.destroy((err) => {
		if (err) {
			console.error('セッションの破棄に失敗しました');
		} else {
			res.redirect('/login');
		}
	});
});

// ファイルのダウンロード (UUID またはオリジナルファイル名で)
app.get('/download/:identifier', requireLogin, (req, res) => {
	const identifier = req.params.identifier;
	const query = `SELECT storedName, originalName FROM files WHERE (storedName = ? OR originalName = ?) AND userId = ?`;

	db.get(query, [identifier, identifier, req.session.user.id], (err, row) => {
		if (err || !row) {
			return res.status(404).send('ファイルが見つかりません');
		}
		res.download(path.join(__dirname, 'uploads', row.storedName), row.originalName, (err) => {
			if (err) {
				console.error('ファイルのダウンロードに失敗しました', err);
				res.status(500).send('ファイルのダウンロードに失敗しました');
			}
		});
	});
});

// すべてのファイルの表示
app.get('/view-file/:id', requireLogin, (req, res) => {
	const fileId = req.params.id;
	db.get(`SELECT storedName, originalName FROM files WHERE (storedName = ? OR originalName = ?) AND userId = ?`, [fileId, fileId, req.session.user.id], (err, row) => {
		if (err || !row) {
			return res.status(404).send('ファイルが見つかりません');
		}

		const filePath = path.join(__dirname, 'uploads', row.storedName);
		const mimeType = mime.lookup(filePath);

		res.setHeader('Content-Type', mimeType);
		fs.createReadStream(filePath).pipe(res);
	});
});

// ダッシュボードページでユーザー情報を返すエンドポイントの追加
app.get('/dashboard/userinfo', requireLogin, (req, res) => {
	if (req.session.user) {
		const { username } = req.session.user;
		res.json({ username });
	} else {
		res.status(401).json({ error: 'ログインが必要です' });
	}
});

// SSL証明書の読み込み
if (isDevelopment) {
	const sslOptions = {
		key: fs.readFileSync(path.resolve(__dirname, '~/src/SSL-CERTIFICATE/localhost.key')),
		cert: fs.readFileSync(path.resolve(__dirname, '~/src/SSL-CERTIFICATE/localhost.crt')),
		hostname: 'fileshare.yu-yu0202.f5.si'
	};
	// HTTPSサーバーの作成
	const httpsServer = https.createServer(sslOptions, app);

	// HTTPSサーバーの起動
	const PORT = process.env.PORT || 443;
	httpsServer.listen(PORT, () => {
		console.log(`HTTPSサーバーが起動しました: https://${options.hostname}:${PORT}/ ,ポートは: ${PORT}`);
		console.log(`現在は 開発モード で起動中です:外部からのアクセス用の証明書は読み込んでいません`);
	});
} else {
	const sslOptions = {
		key: fs.readFileSync(path.resolve(__dirname, '~/src/SSL-CERTIFICATE/key.pem')),
		cert: fs.readFileSync(path.resolve(__dirname, '~/src/SSL-CERTIFICATE/cert.pem')),
		ca: fs.readFileSync(path.resolve(__dirname, '~/src/SSL-CERTIFICATE/fullchain.pem')),
		hostname: 'fileshare.yu-yu0202.f5.si'
	};
	// HTTPSサーバーの作成
	const httpsServer = https.createServer(sslOptions, app);

	// HTTPSサーバーの起動
	const PORT = process.env.PORT || 443;
	httpsServer.listen(PORT, () => {
		console.log(`HTTPSサーバーが起動しました: https://${options.hostname}:${PORT}/ ,ポートは: ${PORT}`);
	});
}

// HTTPからHTTPSへのリダイレクト
const http = require('http');
const httpApp = express();
httpApp.get('*', (req, res) => {
	res.redirect(`https://${req.headers.host}${req.url}`);
});
const HTTP_PORT = process.env.HTTP_PORT || 80;
http.createServer(httpApp).listen(HTTP_PORT, 'fileshare.yu-yu0202.f5.si', () => {
	console.log(`リダイレクト用HTTPサーバーが起動しました: http://fileshare.yu-yu0202.f5.si:${HTTP_PORT} ,リダイレクト先は: https://fileshare.yu-yu0202.f5.si:443`);
});
