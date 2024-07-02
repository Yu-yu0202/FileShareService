// login.js
console.log("読み込みOK")
document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(response => {
            if (response.message === 'OK') {
                const redirectTo = new URLSearchParams(window.location.search).get('redirect_to') || '/dashboard';
                window.location.href = redirectTo;
            } else {
                alert('ログインに失敗しました');
            }
        })
        .catch(error => {
            console.error('エラー:', error);
            alert('ログイン中にエラーが発生しました');
        });
});
