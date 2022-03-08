import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch';
import pdfParse from './utils/importRequire.js'
import 'dotenv/config'


async function readTextFromBuffer(allFileNames, uid) {
    const processedTextFiles = []
    for (let fileName of allFileNames) {
        const file = fs.readFileSync(path.resolve("uploads", uid, fileName))
        const fileExtension = path.extname(fileName)

        if (fileExtension === '.txt') {
            const text = file.toString()
            processedTextFiles.push({ file: fileName, data: text })
        }

        if (fileExtension === '.pdf') {
            const data = await pdfParse(file)
            processedTextFiles.push({ file: fileName, data: data.text })
        }
    }
    return processedTextFiles
}


async function fetchPairWiseResult(processedTextFiles, uid) {
    const pairResults = []

    for (let i = 0; i < processedTextFiles.length; i++) {
        for (let j = i+1; j < processedTextFiles.length; j++) {
            const body = JSON.stringify({
                First: processedTextFiles[i].data,
                Second: processedTextFiles[j].data
            })
            const response = await fetch(process.env.FLASK_SERVER + 'compare_data', {
                method: 'POST',
                body,
                headers: { 'Content-Type': 'application/json' }
            })

            const result = await response.json()
            pairResults.push({
                fileFirst: processedTextFiles[i].file,
                fileSecond: processedTextFiles[j].file,
                result
            })
        }
    }

    return pairResults
}


async function processPDF(uid) {
    try {
        //read all files
        const allFileNames = fs.readdirSync(path.resolve("uploads", uid))
        console.log("All files : ",allFileNames);
        
        const processedTextFiles = await readTextFromBuffer(allFileNames, uid)
        const pairResults = await fetchPairWiseResult(processedTextFiles, uid)

        console.log(pairResults);
        //set the result in reports
        if (!fs.existsSync(path.resolve("reports", uid))) {
            fs.mkdirSync(path.resolve("reports", uid))
        }
        fs.writeFileSync(path.resolve("reports", uid) + "/report.json", JSON.stringify(pairResults))
    }
    catch (error) {
        console.log(error);
    }
}


export default processPDF