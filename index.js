const fs = require("fs");
const path = require("path");

function markdownToPDF(dirname, folder, finalFolderName){
    const markdown = require("markdown-pdf");

    const dir = dirname || __dirname;
    const pathToFolder = path.join(dir, folder);
    fs.readdir(pathToFolder, (err, filesInDir)=> {
        if(err){
            process.exit();
        }
        else{
            const finalFolderName = finalFolderName || folder + "_pdf";
            const pathToSave = path.join(dir, finalFolderName);
            if ( !fs.existsSync(pathToSave) ){
                fs.mkdirSync(pathToSave);
            }        
            filesInDir.forEach(file=>{
                
                if(file.endsWith(".md") && ( !file.includes("foreword") && !file.includes("README") && !file.includes("toc") )){
    
                    fs
                      .createReadStream( path.join( pathToFolder, file ) )
                      .pipe( markdown() )
                      .pipe( fs.createWriteStream( path.join( pathToSave, file + ".pdf" ) ) );
    
                }
    
            });
            
    
        }    
    });
}
// markdownToPDF(__dirname, "folder-name");

function markdownToHTML(dirname, folder, finalFolderName){
    const dir = dirname || __dirname;
    const pathToFolder = path.join(dir, folder);
    const marked = require("marked");
    const filesInDir = fs.readdirSync(pathToFolder);

    const finalFolderNameTosave = finalFolderName || folder + "_html";
    const pathToSave = path.join(dir, finalFolderNameTosave);
    if (!fs.existsSync(pathToSave)) {
        fs.mkdirSync(pathToSave);
    }
    else {
        filesInDir.forEach(file=>{
            if(file.includes(".md")){
                const fileData = fs.readFileSync( path.join(pathToFolder, file) );
                const { StringDecoder } = require('string_decoder');
                const decoder = new StringDecoder('utf8');
                const fileString = decoder.write(fileData);
                const formatedOutputHtmlDirty = `
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <meta http-equiv="X-UA-Compatible" content="ie=edge">
                        <title>Document</title>
                    </head>
                    <body>
                        ${marked(fileString)}
                    </body>
                    </html>
                `;
                const fileSavedPath = path.join( pathToSave, file + ".html" );
                const dompurify = require("dompurify");
                fs.writeFileSync(fileSavedPath, dompurify.sanitize(formatedOutputHtmlDirty));
                
            }
        });
    }
    
    
}
// markdownToHTML(__dirname, "markdownToHTML");
function minifyImages(dirname, folder, imgExtensions, finalFolderName, quality){
    const dir = dirname || __dirname;
    const pathToFolder = path.join(dir, folder);

    const imagemin = require('imagemin');
    const imageminJpegtran = require('imagemin-jpegtran');
    const imageminPngquant = require('imagemin-pngquant');

    async function compressImages(){
        const files = await imagemin([`${pathToFolder || 'images'}/*.${ imgExtensions || '{jpg,png}'}`], {
            destination: finalFolderName ? path.join(dir, finalFolderName) : 'images_min',
            plugins: [
                imageminJpegtran({
                    quality: quality || [0.6, 0.8]
                }),
                imageminPngquant({
                    quality: quality || [0.6, 0.8]
                })
            ]
        });
    }
    compressImages();
}
// minifyImages(__dirname, "images");
function downloadImage(url, filenameIntended) {
    const download = require('image-downloader');
    



    var folder_path = path.join(__dirname, '/download_images/');
    if(!fs.existsSync(folder_path)){
        fs.mkdirSync(folder_path);
    }
    const file_path = path.join(folder_path, (filenameIntended));
    const options = {
        url: url,
        dest: file_path        
    };
    download.image(options)
        .then(({ filename, image }) => {
            console.log("Done");
        })
        .catch((err) => {
            console.log("Error", err);
        })
}
// downloadImage("https://dailyanimeart.files.wordpress.com/2014/06/naruto-and-hinata-hold-hands1.jpg", "naruto_hinata.jpeg")