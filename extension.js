const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	const onDidRenameFilesSubscription = vscode.workspace.onDidRenameFiles(async function(ev){
		const errors = []

		for(const change of ev.files){
			if(!isRenpyFile(change.oldUri)){
				continue
			}
			const oldRpycFile = getBinaryFile(change.oldUri)
			const newRpycFile = getBinaryFile(change.newUri)
			try{
				await vscode.workspace.fs.rename(
					oldRpycFile,
					newRpycFile,
					{
						overwrite: false
					}
				)
			}
			catch(e){
				if(e instanceof vscode.FileSystemError && e.code != 'FileNotFound'){
					errors.push(e.message)
				}
			}
		}

		if(errors){
			vscode.window.showErrorMessage(errors.join('\n'))
		}
	})
	const onDidDeleteFilesSubscription = vscode.workspace.onDidDeleteFiles(async function(ev){
		const errors = []

		for(const file of ev.files){
			if(!isRenpyFile(file)){
				continue
			}
			const rpycFile = getBinaryFile(file)
			try{
				await vscode.workspace.fs.delete(
					rpycFile,
					{
						recursive: false,
						useTrash: true
					}
				)
			}
			catch(e){
				if(e instanceof vscode.FileSystemError && e.code != 'FileNotFound'){
					errors.push(e.message)
				}
			}
		}

		if(errors){
			vscode.window.showErrorMessage(errors.join('\n'))
		}
	})

	context.subscriptions.push(onDidRenameFilesSubscription)
	context.subscriptions.push(onDidDeleteFilesSubscription)
}


const renpyFilePattern = /.*\.(?:rpym|rpy)/i

/**
 * @param {vscode.Uri} file 
 */
function isRenpyFile(file){
	return renpyFilePattern.test(file.path)
}

/**
 * @param {vscode.Uri} file
 * @return {vscode.Uri}
 */
function getBinaryFile(file){
	return file.with({
		path: file.path + 'c'
	})
}

// this method is called when your extension is deactivated
function deactivate() {

}

module.exports = {
	activate,
	deactivate
}
