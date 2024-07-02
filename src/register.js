document.getElementById('registerForm').addEventListener('submit', function (event) {
	event.preventDefault();

	const username = document.getElementById('username').value;
	const password = document.getElementById('password').value;

	fetch('/register', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ username, password })
	})
		.then(response => response.text())
		.then(data => {
			const messageDiv = document.getElementById('message');
			messageDiv.textContent = data;
		})
		.catch(error => {
			console.error('エラー:', error);
			const messageDiv = document.getElementById('message');
			messageDiv.textContent = 'ユーザーの作成に失敗しました。';
		});
});