const express = require('express')
const multer = require('multer')
const fs = require('fs')
const path = require('path')
require('dotenv').config()

const { v4: uuidv4, validate:uuidValidate  } = require('uuid');

const upload = multer()

const app = express()

function saveUID(uid) {
    fs.appendFileSync(path.join(__dirname, "alluids"),uid+"\n")
}


//send new uid to frontend and create a folder of that uid on the server
app.get('/uid', function (req, res, next) {
    try {
        const uid = uuidv4()

        fs.mkdir(path.join(__dirname, "uploads",uid), error => {
            if (error) {
                console.error(error);
                res.status(500).send("Unable to create directory")
            }
            saveUID(uid)
            console.log('Directory created successfully!');
            res.send(uid)
        });
    }

    catch (error) {
        console.log(error);
        res.status(500).send()
    }
})



//save the file in this path
app.post('/upload/:uid/:fileId', upload.single('file'), function (req, res, next) {
    try {
        //qweruuj-983uuj
        const { uid, fileId } = req.params

        if (!uid || !fileId) res.status(400).send("Provide uid and fileid")
        // console.log(uuidv4);
        if (!uuidValidate(uid)) res.status(400).send("Provide valid uid")

        // console.log(req, req.body.someName);

        const file = req.file
        const fileName = req.body.fileName

        //check if file exhist or not
        if (!file) res.status(400).send("Provide file")
        if (!fileName) res.status(400).send("Provide file name")
        
        //save file
        const pathToSave = path.join(__dirname, "uploads", uid, fileName)
        
        console.log(file);
        console.log({ uid, pathToSave });

        fs.writeFileSync(pathToSave,JSON.stringify(file))
        res.send("File uploaded successfully")
    
    }
  
    catch (error) { 
        console.log(error);
        res.status(500).send()
    }
})


//temporary function
app.get('/alluid', function (req, res, next) {
    try {
        const file = fs.readFileSync('alluids')
        res.json(file.toString())
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