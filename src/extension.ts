// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { match } from 'assert';
const path = require('path');
const fs = require('fs');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "helloworld" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    // let disposable = vscode.commands.registerCommand('extension.helloWorld', () => {
    //     // The code you place here will be executed every time your command is executed

    //     // Display a message box to the user
    //     vscode.window.showInformationMessage('Hello World from HelloWorld!');
    // });

    // function provideHover(document: any, position: any, token: any) {
    //     const fileName = document.fileName;
    //     const workDir = path.dirname(fileName);
    //     const word = document.getText(document.getWordRangeAtPosition(position));
    //     // console.log("provideHover", document, vscode);
    //     if (/\w+.json$/.test(fileName)) {
    //         console.log('进入provideHover方法');
    //         const json = document.getText();
    //         // if (new RegExp(`"(dependencies|devDependencies)":\\s*?\\{[\\s\\S]*?${word.replace(/\//g, '\\/')}[\\s\\S]*?\\}`, 'gm').test(json)) {
    //         let destPath = `${workDir}/node_modules/${word.replace(/"/g, '')}/package.json`;
    //         // if (fs.existsSync(destPath)) {
    //         const content = { name: "测试" };
    //         console.log('hover已生效');
    //         // hover内容支持markdown语法
    //         return new vscode.Hover(`<button>测试</button>* **名称**：${content.name}`);
    //         // }
    //         // }
    //     }
    // }

    // context.subscriptions.push(vscode.languages.registerHoverProvider('json', {
    //     provideHover
    // }));

    context.subscriptions.push(vscode.commands.registerCommand('extension.demo.getCurrentFilePath', (uri) => {
        let vEditor = vscode.window.activeTextEditor;
        let fenhaoReg = /([^ :]+) *:/;
        let bracketReg = /({|})/;
        let leftBracketReg = /{/;
        let rightBracketReg = /}/;
        let douhaoReg = /(?<=:[^:]*)("|'|`).+("|'|`)/g;
        let blankReg = / +/g;
        if (vEditor) {
            let lineNum = vEditor?.selection?.active.line;
            if (lineNum) {
                let list: any[] = [];
                let leftBracketNum = 0;
                let rightBracketNum = 0;
                //聚焦行处理
                let lineTextReplaceSemiconlon = getReplacedTextByNum(vEditor, lineNum, douhaoReg);
                if (fenhaoReg.test(lineTextReplaceSemiconlon)) {

                    if (bracketReg.test(lineTextReplaceSemiconlon)) {
                        if (rightBracketReg.test(lineTextReplaceSemiconlon) && leftBracketReg.test(lineTextReplaceSemiconlon)) {
                            pushList(lineTextReplaceSemiconlon, fenhaoReg, list);
                        } else if (rightBracketReg.test(lineTextReplaceSemiconlon)) {
                            //右括号暂不处理
                            return "";
                        } else {
                            if (!rightBracketNum) {
                                pushList(lineTextReplaceSemiconlon, fenhaoReg, list);
                            }
                        }
                    } else {
                        pushList(lineTextReplaceSemiconlon, fenhaoReg, list);
                    }
                }

                for (var i = lineNum - 1; i > 0; i--) {

                    let lineTextReplaceSemiconlon = getReplacedTextByNum(vEditor, i, douhaoReg);
                    // console.log(lineTextReplaceSemiconlon, i);
                    if (fenhaoReg.test(lineTextReplaceSemiconlon)) {
                        if (bracketReg.test(lineTextReplaceSemiconlon)) {

                            if (rightBracketReg.test(lineTextReplaceSemiconlon) && leftBracketReg.test(lineTextReplaceSemiconlon)) {
                                continue;
                            } else {
                                if (leftBracketReg.test(lineTextReplaceSemiconlon)) {
                                    if (rightBracketNum == 0) {
                                        pushList(lineTextReplaceSemiconlon, fenhaoReg, list);
                                    }
                                    rightBracketNum > 0 && --rightBracketNum;

                                }
                                // rightBracketNum > 0 ;
                            }
                        }

                    } else if (rightBracketReg.test(lineTextReplaceSemiconlon)) {
                        rightBracketNum++;
                    } else if (leftBracketReg.test(lineTextReplaceSemiconlon)) {
                        leftBracketNum++;
                    } else if (!leftBracketReg.test(lineTextReplaceSemiconlon) || blankReg.test(lineTextReplaceSemiconlon)) {
                        let lineTextReplaceSemiconlonPrev = getReplacedTextByNum(vEditor, i - 1, douhaoReg);
                        if (!fenhaoReg.test(lineTextReplaceSemiconlonPrev)) {
                            break;
                        }
                    }

                }
                // console.log("list", list);
                let keyString = list.reverse().map(key => {
                    return key.replace(/^(['" 	])+/, "").replace(/(['" 	])+$/, "");
                }).join(".");
                vscode.env.clipboard.writeText(keyString).then(() => {
                    vscode.window.showInformationMessage(`复制成功!`, keyString);

                });
            } else {
                return "";
            }
        };
    }
        // context.subscriptions.push(disposable);
    ))
}
// this method is called when your extension is deactivated
export function deactivate() { }

function getTextByNum(vEditor: any, num: number) {
    return vEditor?.document?.lineAt(num)?.text || "";
}
function getReplacedTextByNum(vEditor: any, num: number, reg: any) {
    let text = getTextByNum(vEditor, num);
    return text.replace(reg, "");
}
function pushList(text: string, reg: any, list: any[]) {
    let matchString = text.match(reg);
    console.log("lineTextReplaceSemiconlon",text,matchString)

    if (matchString && matchString[1]) {
        list.push(matchString[1]);
    }
}