document.addEventListener('DOMContentLoaded', () => {
    fetch('/files')
        .then(response => response.json())
        .then(files => {
            const fileList = document.getElementById('fileList');
            files.forEach(file => {
                const row = document.createElement('tr');
                const fileNameCell = document.createElement('td');
                const uploadDateCell = document.createElement('td');
                const actionCell = document.createElement('td');

                const fileLink = document.createElement('a');
                fileLink.href = `/files/view/${file.id}`;
                fileLink.textContent = file.name;
                fileNameCell.appendChild(fileLink);

                uploadDateCell.textContent = new Date(file.uploadDate).toLocaleString();
                const downloadLink = document.createElement('a');
                downloadLink.href = `/files/${file.id}`;
                downloadLink.textContent = 'ダウンロード';
                actionCell.appendChild(downloadLink);

                row.appendChild(fileNameCell);
                row.appendChild(uploadDateCell);
                row.appendChild(actionCell);
                fileList.appendChild(row);
            });
        })
        .catch(error => {
            console.error('ファイル情報の取得に失敗しました:', error);
        });
});