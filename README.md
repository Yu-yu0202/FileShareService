# FileShareService
シンプルなGUIでファイルのアップロード、ダウンロード等をログイン制で行うことができるNode.jsアプリケーションです。

---

## 特徴
- ユーザー登録、ログイン機能
- ファイルのアップロード、ダウンロード機能
- 管理者によるファイルの可視性管理(beta版のため提供はしていませんがエンドポイントは一応あります)
- HTTPSによるセキュアな通信
- Express-Sessionを用いたセッション管理

## 前提条件
以下のソフトウェアがインストールされている必要があります:
- Node.js(Ver:16.x.x以上)
- npm(Node.js付随)
- Git(CUIでもGUIでもGitHub Desktopでもネットからコード引っ張ってきてもいいです)

## インストール
### リポジトリのクローン
Github Desktopでやる方やコードを引っ張ってくる人はスキップしてください
```sh
$ git clone https://github.com/yu-yu0202/FileShareService.git
$ cd FileShareService
```
### 依存関係のインストール
```sh
$ npm install
$ npm install --save-dev cross-env nodemon
```
### SSL証明書の準備
[SSLなう!(v2)](https://sslnow.16mhz.net)がおすすめです。
srcフォルダに「SSL-CERTIFICATE」というフォルダを作成し、その中に入れてください。
### 環境変数の設定
.env ファイルを設定します。内容は各自変更してください。
```sh
$ echo "ADMIN_PW= Password_here" > .env
```
### 開発環境での実行
開発環境では、以下のコマンドでサーバーを起動します:
```sh
$ npm run dev
```
### 本番環境でのデプロイ
このアプリケーションは、GithubActionsで実行することはお勧めできません ~~（アホみたいに料金かかります、多分）~~

個人的なおすすめは、OCI（Always Free枠）の、AMD E4 Flexインスタンス、またはArmベースインスタンスです。
### ライセンス
このアプリケーションは、AGPL v3 ライセンスの下で公開されています。詳細については「LICENSE.md」ファイルを参照してください。
### 貢献
バグ報告(Issue)や機能リクエスト、プルリクエストは大歓迎です。
### 作者
- 名前：ゆーゆー
- Github:[Yu-yu0202](https://github.com/yu-yu0202)
#### ~~~ Powered by ChatGPT ~~~