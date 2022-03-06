const express = require('express')
const multer = require('multer')
const fs = require('fs')
const path = require('path')
const { v4: uuidv4, validate: uuidValidate } = require('uuid');


require('dotenv').config()
const upload = multer()
const app = express()
const process = require('./process.mjs')

function saveUID(uid) {
    fs.appendFileSync(path.join(__dirname, "alluids"), uid + "\n")
}



//send new uid to frontend and create a folder of that uid on the server
app.get('/uid', function (req, res, next) {
    try {
        // #Creating the data
        const uid = uuidv4()
        const directoryPath = path.join(__dirname, "uploads", uid)


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


app.post('/process/:uid', function (req, res) {
    try {
        const { uid } = req.params

        if (!uid) res.status(400).send("Provide uid")
        process(uid)

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
        const pathToSave = path.join(__dirname, "uploads", uid, fileName)
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
        const doesUIDExhist = fs.existsSync(path.join(__dirname,"reports",uid))
        if (!doesUIDExhist) res.send("UID does not exhist")
        
        //if folder is present
        //check for report
        const isReportReady = fs.existsSync(path.join(__dirname, "reports", uid, 'report'))
        if (!isReportReady) res.send("Report not ready") 

        //send report
        const report = fs.readFileSync(path.join(__dirname, "reports", uid, 'report'))
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