const express = require('express')
const { get } = require('express/lib/response')
const res = require('express/lib/response')
const dbPool = require('./connection/db')

const app = express()
// const path = require('path')
const port = 5000

const db = require('./connection/db')

// view engine setup 
app.set('view engine', "hbs") // set view engine hbs

app.use('/public', express.static(__dirname + '/public')) // set public path/folder

app.use(express.urlencoded({ extended: false })) // encode / convert

let isLogin = true; // set if user login

let projects = []


// SHOW FETCH DATABASE
app.get('/', function (req, res) {
    db.connect(function (err, client, done) {
        if (err) throw err // Kondisi untuk menampilkan error koneksi database

        client.query(`SELECT * FROM tb_projects`, function (err, result) {
            if (err) throw err // Kondisi untuk menampilkan error query
            let data = result.rows
            done();

            data = data.map(function (item) {
                return {
                    ...item,
                    projectName: item.name,
                    description: item.description.slice(0, 150) + '.....',
                    duration: durationProject(item.start_date, item.end_date),
                    nodeJs: checkboxes(item.technologies[0]),
                    reactJs: checkboxes(item.technologies[1]),
                    laravel: checkboxes(item.technologies[2]),
                    ember: checkboxes(item.technologies[3]),
                    isLogin: isLogin
                }
            })
            console.log(data);
            res.render('index', { login: isLogin, project: data })
        })
    })
})

// GET: DELETE PROJECT
app.get('/delete-project/:id', (req, res) => {
    let id = req.params.id

    const query = `DELETE FROM public.tb_projects WHERE id=${id};`

    db.connect(function (err, client, done) {
        if (err) throw err // Kondisi untuk menampilkan error koneksi database

        client.query(query, function (err, result) {
            if (err) throw err // Kondisi untuk menampilkan error query
            done();
        })

        res.redirect('/')
    })
})

// GET: APP PROJECT
app.get('/add-project', function (req, res) {

    res.render('add-project')
})

// GET: CONTACT
app.get('/contact', function (req, res) {
    res.render('contact')
})

// GET: DETAIL PROJECT
app.get('/detail-project/:id', function (req, res) {
    const id = req.params.id
    const query = `SELECT * FROM tb_projects WHERE id=${id}`

    db.connect(function (err, client, done) {
        if (err) throw err // Mengecek tampilan error koneksi database

        client.query(query, function (err, result) {
            if (err) throw err
            let data = result.rows[0]
            done();

            data = {
                projectName: data.name,
                description: data.description,
                startDate: getFullTime(data.start_date),
                endDate: getFullTime(data.end_date),
                duration: durationProject(data.start_date, data.end_date),
                nodeJs: checkboxes(data.technologies[0]),
                reactJs: checkboxes(data.technologies[1]),
                laravel: checkboxes(data.technologies[2]),
                ember: checkboxes(data.technologies[3]),
            }


            res.render('detail-project', { project: data })
        })
    })
})

// POST: ADD PROJECT
app.post('/add-project', function (req, res) {
    let data = req.body

    data = {
        projectName: data.projectName,
        description: data.description,
        startDate: data.starDate,
        endDate: data.endDate,
        nodeJs: checkboxes(data.nodeJs),
        reactJs: checkboxes(data.reactJs),
        laravel: checkboxes(data.laravel),
        ember: checkboxes(data.ember),
        image: data.image
    }

    // console.log(data)

    const query = `INSERT INTO public.tb_projects(
        name, "start_date", "end_date", description, technologies, image)
        VALUES ('${data.projectName}', '${data.startDate}', '${data.endDate}', '${data.description}', 
        '{"${data.nodeJs}","${data.reactJs}","${data.laravel}","${data.ember}"}', '${data.image}')`

    db.connect(function (err, client, done) {
        if (err) throw err

        client.query(query, function (err, result) {
            if (err) throw err
            done()

            res.redirect('/') // berpindah halaman ke route /index
        })
    })
})

// GET DATA for UPDATE PROJECT
app.get('/edit-project/:id', (req, res) => {
    const id = req.params.id

    const query = `SELECT * FROM tb_projects WHERE id=${id}`

    db.connect(function (err, client, done) {
        if (err) throw err // Mengecek tampilan error koneksi database

        client.query(query, function (err, result) {
            if (err) throw err
            let data = result.rows[0]
            // console.log(result.rows[0]);
            done();

            data = {
                id:id,
                projectName: data.name,
                description: data.description,
                startDate: convertFormatDate(data.start_date), //! format datenya di convert, 
                endDate: convertFormatDate(data.end_date), //! format datenya di convert, 
                nodeJs: checkboxes(data.technologies[0]),
                reactJs: checkboxes(data.technologies[1]),
                laravel: checkboxes(data.technologies[2]),
                ember: checkboxes(data.technologies[3]),
                image: data.image
            }
            console.log(data);
            res.render('edit-project', { project: data })
        })
    })
})

// POST: UPDATE PROJECT
app.post('/update-project/:id', (req, res) => {
    let data = req.body
    let id = req.params.id

    data = {
        projectName: data.projectName,
        description: data.description,
        startDate: data.starDate,
        endDate: data.endDate,
        nodeJs: checkboxes(data.nodeJs),
        reactJs: checkboxes(data.reactJs),
        laravel: checkboxes(data.laravel),
        ember: checkboxes(data.ember),
        image: data.image
    }

    // console.log(data);

    const query = `UPDATE public.tb_projects 
    SET name='${data.projectName}', start_date='${data.startDate}', end_date='${data.endDate}', description='${data.description}', technologies='{"${data.nodeJs}","${data.reactJs}","${data.laravel}","${data.ember}"}', image='${data.image}'
    WHERE id=${id};`

    db.connect(function (err, client, done) {
        if (err) throw err // Mengecek tampilan error koneksi database

        client.query(query, function (err, result) {
            if (err) throw err
            done();

            res.redirect('/')
        })
    })
})



function durationProject(startDate, endDate) {
    let start = new Date(startDate);
    let end = new Date(endDate);

    
    let duration = end.getTime() - start.getTime();
    let year = Math.floor(duration / (1000 * 3600 * 24 * 30 * 12))
    let month = Math.round(duration / (1000 * 3600 * 24 * 30));
    let day = duration / (1000 * 3600 * 24)

    if (day < 30) {
        return `${day} Day`;
    } else if (month < 12) {
        return `${month} Month`;
    } else {
        return `${year} Year`
    }
}

function getFullTime(time) {

    let month = ['Januari', 'Febuari', 'Maret', 'April', 'Mei', 'Juni', 'July', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

    let date = time.getDate()
    // console.log(date);

    let monthIndex = time.getMonth()
    // console.log(month[monthIndex]);

    let year = time.getFullYear()
    // console.log(year);

    let hours = time.getHours()
    let minutes = time.getMinutes()

    let dateTime = `${date} ${month[monthIndex]} ${year} `

    let fullTime = `${date} ${month[monthIndex]} ${year} ${hours}:${minutes} WIB`

    return dateTime
}

function convertFormatDate(waktu) {

    let date = waktu.getDate().toString().padStart(2, "0");

    let monthIndex = (waktu.getMonth() + 1).toString().padStart(2, "0")

    let year = waktu.getFullYear()
    let hours = waktu.getHours()
    let minutes = waktu.getMinutes()

    let fullTime = `${year}-${monthIndex}-${date}`
    return fullTime
}

function checkboxes(condition) {
    if (condition === 'on' || condition === 'true') {
        return true
    } else{
        return false
    }
}

app.listen(port, function () {
    console.log(`Server Listen on port ${port}`);
})

