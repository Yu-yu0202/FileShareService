document.addEventListener('DOMContentLoaded', () => {
	fetch('/all-files')
		.then(response => response.json())
		.then(files => {
			const fileList = document.getElementById('fileList');
			files.forEach(file => {
				const row = document.createElement('tr');
				const fileNameCell = document.createElement('td');
				const uploadDateCell = document.createElement('td');
				const visibilityCell = document.createElement('td');
				const actionCell = document.createElement('td');

				fileNameCell.textContent = file.name;
				uploadDateCell.textContent = new Date(file.uploadDate).toLocaleString();

				const visibilitySelect = document.createElement('select');
				const visibleOption = document.createElement('option');
				visibleOption.value = '1';
				visibleOption.textContent = '可視';
				const hiddenOption = document.createElement('option');
				hiddenOption.value = '0';
				hiddenOption.textContent = '非表示';
				visibilitySelect.appendChild(visibleOption);
				visibilitySelect.appendChild(hiddenOption);
				visibilitySelect.value = file.visible;
				visibilitySelect.addEventListener('change', () => {
					fetch(`/update-visibility/${file.id}`, {
						method: 'PUT',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({ visible: visibilitySelect.value })
					});
				});
				visibilityCell.appendChild(visibilitySelect);

				const deleteButton = document.createElement('button');
				deleteButton.textContent = '削除';
				deleteButton.addEventListener('click', () => {
					fetch(`/delete-file/${file.id}`, {
						method: 'DELETE'
					})
						.then(() => {
							row.remove();
						});
				});
				actionCell.appendChild(deleteButton);

				row.appendChild(fileNameCell);
				row.appendChild(uploadDateCell);
				row.appendChild(visibilityCell);
				row.appendChild(actionCell);
				fileList.appendChild(row);
			});
		})
		.catch(error => {
			console.error('ファイルリストの取得に失敗しました:', error);
		});
});