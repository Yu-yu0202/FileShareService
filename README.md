# FileShareService
�V���v����GUI�Ńt�@�C���̃A�b�v���[�h�A�_�E�����[�h�������O�C�����ōs�����Ƃ��ł���Node.js�A�v���P�[�V�����ł��B

---

## ����
- ���[�U�[�o�^�A���O�C���@�\
- �t�@�C���̃A�b�v���[�h�A�_�E�����[�h�@�\
- �Ǘ��҂ɂ��t�@�C���̉����Ǘ�(beta�ł̂��ߒ񋟂͂��Ă��܂��񂪃G���h�|�C���g�͈ꉞ����܂�)
- HTTPS�ɂ��Z�L���A�ȒʐM
- Express-Session��p�����Z�b�V�����Ǘ�

## �O�����
�ȉ��̃\�t�g�E�F�A���C���X�g�[������Ă���K�v������܂�:
- Node.js(Ver:16.x.x�ȏ�)
- npm(Node.js�t��)
- Git(CUI�ł�GUI�ł�GitHub Desktop�ł��l�b�g����R�[�h���������Ă��Ă������ł�)

## �C���X�g�[��
### ���|�W�g���̃N���[��
Github Desktop�ł�����R�[�h�����������Ă���l�̓X�L�b�v���Ă�������
```sh
$ git clone https://github.com/yu-yu0202/FileShareService.git
$ cd FileShareService
```
### �ˑ��֌W�̃C���X�g�[��
```sh
$ npm install
$ npm install --save-dev cross-env nodemon
```
### SSL�ؖ����̏���
[SSL�Ȃ�!(v2)](https://sslnow.16mhz.net)���������߂ł��B
src�t�H���_�ɁuSSL-CERTIFICATE�v�Ƃ����t�H���_���쐬���A���̒��ɓ���Ă��������B
### ���ϐ��̐ݒ�
.env �t�@�C����ݒ肵�܂��B���e�͊e���ύX���Ă��������B
```sh
$ echo "ADMIN_PW= Password_here" > .env
```
### �J�����ł̎��s
�J�����ł́A�ȉ��̃R�}���h�ŃT�[�o�[���N�����܂�:
```sh
$ npm run dev
```
### �{�Ԋ��ł̃f�v���C
���̃A�v���P�[�V�����́AGithubActions�Ŏ��s���邱�Ƃ͂����߂ł��܂��� ~~�i�A�z�݂����ɗ���������܂��A�����j~~

�l�I�Ȃ������߂́AOCI�iAlways Free�g�j�́AAMD E4 Flex�C���X�^���X�A�܂���Arm�x�[�X�C���X�^���X�ł��B
### ���C�Z���X
���̃A�v���P�[�V�����́AAGPL v3 ���C�Z���X�̉��Ō��J����Ă��܂��B�ڍׂɂ��ẮuLICENSE.md�v�t�@�C�����Q�Ƃ��Ă��������B
### �v��
�o�O��(Issue)��@�\���N�G�X�g�A�v�����N�G�X�g�͑劽�}�ł��B
### ���
- ���O�F��[��[
- Github:[Yu-yu0202](https://github.com/yu-yu0202)
#### ~~~ Powered by ChatGPT ~~~