const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	let onDidRenameFilesSubscription = vscode.workspace.onDidRenameFiles(async function(e){
		let errors = []
		for(let file of e.files){
			if(file.oldUri.path.endsWith('.rpy')){
				let oldRpycFile = file.oldUri.with({
					path:file.oldUri.path+'c'
				})
				try{
					await vscode.workspace.fs.stat(oldRpycFile)
				}
				catch(err){
					continue
				}
				let newRpycFile = file.oldUri.with({
					path:file.newUri.path+'c'
				})
				try{
					await vscode.workspace.fs.rename(
						oldRpycFile,
						newRpycFile,
						{
							overwrite: false
						}
					)
				}
				catch(err){
					errors.push(err)
				}
			}
			if(errors){
				vscode.window.showErrorMessage(errors.join("\n"))
			}
		}
	})

	context.subscriptions.push(onDidRenameFilesSubscription);
}

// this method is called when your extension is deactivated
function deactivate() {

}

module.exports = {
	activate,
	deactivate
}
