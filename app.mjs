import express from 'express'
import multer from 'multer'
import fs from 'fs'
import path from 'path'
import { v4 as uuidv4, validate as uuidValidate } from 'uuid'
import 'dotenv/config'

const upload = multer()
const app = express()
import processorML  from './process.mjs'

function saveUID(uid) {
    fs.appendFileSync(path.resolve("alluids"), uid + "\n")
}



//send new uid to frontend and create a folder of that uid on the server
app.get('/uid', function (req, res, next) {
    try {
        // #Creating the data
        const uid = uuidv4()
        const directoryPath = path.resolve("uploads", uid)


        // #Creating directory and saving its name in file
        fs.mkdirSync(directoryPath)
        saveUID(uid)
        console.log('Directory created successfully!');
        
        
        res.send(uid)

    }

    catch (error) {
        console.log(error);
        res.status(500).send()
    }
})


app.get('/process/:uid', function (req, res) {
    try {
        const { uid } = req.params

        if (!uid) res.status(400).send("Provide uid")
        processorML(uid)

        res.send("Processing started")

    }
    catch (error) {
        console.log(error);
        res.status(500).send()
    }
})

//save the file in this path
app.post('/upload/:uid/:fileId', upload.single('file'), function (req, res, next) {
    try {
        // #Reading required data
        const { uid, fileId } = req.params
        const file = req.file
        const fileName = req.body.fileName

        // #Checks
        if (!uid || !fileId) res.status(400).send("Provide uid and fileid")
        if (!uuidValidate(uid)) res.status(400).send("Provide valid uid")
        if (!file) res.status(400).send("Provide file")
        if (!fileName) res.status(400).send("Provide file name")


        //#Saving file
        const pathToSave = path.resolve( "uploads", uid, fileName)
        console.log({ file,uid, pathToSave });
        fs.writeFileSync(pathToSave,file.buffer)


        res.send("File uploaded successfully")

    }
    catch (error) {
        console.log(error);
        res.status(500).send()
    }
})

//to get the report
app.get('/report/:uid', function (req, res) {
    try {
        const { uid } = req.params

        if (!uid) res.status(400).send("Provide uid")

        //check for uid in reports folder
        const doesUIDExhist = fs.existsSync(path.resolve("reports",uid))
        if (!doesUIDExhist) res.send("UID does not exhist")
        
        //if folder is present
        //check for report
        const isReportReady = fs.existsSync(path.resolve( "reports", uid, 'report.json'))
        if (!isReportReady) res.send("Report not ready") 

        //send report
        const report = fs.readFileSync(path.resolve( "reports", uid, 'report.json'))
        res.send(report)
    }
    catch (error) {
        console.log(error);
        res.status(500).send()
    }

})


app.listen(process.env.PORT, () => {
    const port = process.env.PORT
    console.log(`Server running on port ${port}`)
})