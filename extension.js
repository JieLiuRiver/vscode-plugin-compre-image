const vscode = require('vscode');
const tinify = require('tinify');
const path = require('path');

const TINIFY_KEY = 'Y4y4NfM6qkKbbDpZcgyC0hCjJnVQMPBY'

/**
 * 插件被激活时触发，所有代码总入口
 * @param {*} context 插件上下文
 */
exports.activate = function(context) {
	// 注册命令
	context.subscriptions.push(
		vscode.commands.registerCommand('extension.compress', function async(uri, fileList) {
			// vscode.window.showInformationMessage('Hello Compress!');
			const list = fileList && fileList.length ? fileList : [uri]
			for (const file of list) {
				try {
					console.log('file', file)
					if (file) {
						handleCompress(file);
						return;
					}
					vscode.window.showInputBox({
						value: '',
						placeHolder: '请输入网络图片地址',
						validateInput: text => {
							let result = !text;
							if (
								!(text.startsWith('http://') || text.startsWith('https://'))
							) {
								result = true
							}
							if (
								!(text.endsWith('.png') ||
								text.endsWith('.jpg') ||
								text.endsWith('.jpeg') ||
								text.endsWith('.svg') ||
								text.endsWith('.gif'))
							) {
								result = true
							}
							return result ? '请输入合法网络图片链接地址' : null;
						}
					})
					.then(res => {
						handleNetWorkCompress(res)
					});
				} catch (err) {
					console.error(err);
				}
			}
		})
	);
}

const handleNetWorkCompress = (url) => {
	tinify.key = vscode.workspace.getConfiguration().get("vscodePluginDemo.tinifyKey");
	const ext = path.extname(url);
  const filename = path.basename(url, ext);
	const source = tinify.fromUrl(url);
	let folder = null;
	if (vscode.workspace.workspaceFolders.length) {
		folder = vscode.workspace.workspaceFolders[0]
	}
	const saveDirname = vscode.workspace.getConfiguration().get("vscodePluginDemo.saveDirname");
	console.log('saveDirname', saveDirname)
	if (folder) {
		source.toFile(
			path.join(
				folder.uri.path + saveDirname,
				`${Date.now()}.min.` + ext.replace(/^\./, "")
			)
		)
		.then((res) => {
			vscode.window.showInformationMessage(`${filename} 压缩成功～！`)
		})
		.catch((e) => {
			console.log(e)
		})
	}
}

const handleCompress = (uri) => {
	tinify.key = vscode.workspace.getConfiguration().get("vscodePluginDemo.tinifyKey");
	const ext = path.extname(uri.fsPath);
	const source = tinify.fromFile(uri.fsPath);
  const filename = path.basename(uri.fsPath, ext);
  source.toFile(
    path.join(
      path.dirname(uri.fsPath),
      filename + ".optimized." + ext.replace(/^\./, "")
    )
  )
  .then((res) => {
		vscode.window.showInformationMessage(`${filename} 压缩成功～！`)
  })
  .catch((e) => {
    console.log(e)
  })
}


/**
 * 插件被释放时触发
 */
exports.deactivate = function() {
	console.log('您的扩展“vscode-plugin-demo”已被释放！')
};