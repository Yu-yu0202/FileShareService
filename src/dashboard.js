console.log('読み込みOK');
function logout() {
	const confirm = window.confirm("ログアウトします。よろしいですか?");
	if (confirm) {
		window.alert("ログアウトしました。");
		location.href = '/logout';
	}
}
document.addEventListener('DOMContentLoaded', () => {
	fetch('/dashboard/userinfo')
		.then(response => response.json())
		.then(data => {
			const { username } = data;
			const welcomeMessage = document.getElementById('welcomeMessage');
			welcomeMessage.textContent = `ようこそ、${username} さん！`;
		})
		.catch(error => {
			console.error('ユーザー情報の取得に失敗しました:', error);
		});

	// アップロードされたファイルのリストを取得して表示する
	fetch('/files')
		.then(response => response.json())
		.then(files => {
			const fileList = document.getElementById('fileList');
			files.forEach(file => {
				const row = document.createElement('tr');
				const fileNameCell = document.createElement('td');
				const uploadDateCell = document.createElement('td');
				const actionCell = document.createElement('td');

				fileNameCell.textContent = file.name;
				uploadDateCell.textContent = new Date(file.uploadDate).toLocaleString();

				const downloadLink = document.createElement('a');
				downloadLink.href = `/download/${file.name}`; // ダウンロードリンクのURLを修正
				downloadLink.textContent = 'ダウンロード'; // ダウンロードリンクのテキスト
				actionCell.appendChild(downloadLink);
				row.appendChild(fileNameCell);
				row.appendChild(uploadDateCell);
				row.appendChild(actionCell);
				fileList.appendChild(row);
			});
		})
		.catch(error => {
			console.error('ファイルリストの取得に失敗しました:', error);
		});
});
document.getElementById('uploadForm').addEventListener('submit', function (event) {
	const fileInput = document.querySelector('input[type="file"]');
	if (fileInput.files.length === 0 || fileInput.files[0].size === 0) {
		event.preventDefault();
		alert('ファイルを選択してください。');
	};
});