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

app.get('/', function (req, res) {

    db.connect(function (err, client, done) {
        if (err) throw err // Mengecek tampilan error koneksi database

        client.query('SELECT * FROM tb_projects', function (err, result) {
            if (err) throw err // Mengecek query
            let data = result.rows // 

            data = data.map(function (item) {
                return {
                    ...item,
                    projectName: item.name,
                    description: item.description.slice(0, 150) + '.....',
                    startDate: item.start_date,
                    endDate: item.end_date,
                    duration: durationProject(new Date(item.start_date), new Date(item.end_date)),
                    nodeJs: checkboxes(item.technologies[0]),
                    reactJs: checkboxes(item.technologies[1]),
                    nextJs: checkboxes(item.technologies[2]),
                    typescript: checkboxes(item.technologies[3]),
                    isLogin: isLogin
                }
            })
            res.render('index', { login: isLogin, projects: data })
        })
    })
})

app.get('/delete-project/:index', (req, res) => {
    let index = req.params.index
    projects.splice(index, 1)
    res.redirect('/')

})

app.get('/add-project', function (req, res) {

    res.render('add-project')
})

app.get('/contact', function (req, res) {
    res.render('contact')
})

app.get('/detail-project/:id', function (req, res) {
    const id = parseInt(req.params.id)

    db.connect(function (err, client, done) {
        if (err) throw err // Mengecek tampilan error koneksi database

        client.query('SELECT * FROM tb_projects WHERE id=$1', [id], function (err, result) {
            let data = result.rows

            data = data.map(function (item) {
                return {
                    ...item,
                    projectName: item.name,
                    description: item.description,
                    startDate: getFullTime(item.start_date),
                    endDate: getFullTime(item.end_date),
                    duration: durationProject(new Date(item.start_date), new Date(item.end_date)),
                    nodeJs: checkboxes(item.technologies[0]),
                    reactJs: checkboxes(item.technologies[1]),
                    nextJs: checkboxes(item.technologies[2]),
                    typescript: checkboxes(item.technologies[3]),
                    isLogin: isLogin
                }
            })
            console.log(data);
            res.render('detail-project', { projects: data })
        })
    })
})

// Add Project
app.post('/add-project', function (req, res) {
    // console.log(req.body)
    let data = req.body

    data = {
        projectName: data.projectName,
        description: data.description,
        startDate: data.starDate,
        endDate: data.endDate,
        duration: durationProject(new Date(data.starDate), new Date(data.endDate)),
        nodeJs: checkboxes(data.nodeJs),
        reactJs: checkboxes(data.reactJs),
        nextJs: checkboxes(data.nextJs),
        typescript: checkboxes(data.typescript),
        image: data.image
    }

    projects.push(data)

    // console.log(projects);
    res.redirect('/') // Berpindah Halaman
})

app.get('/edit-project/:id', (req, res) => {
    const id = parseInt(req.params.id)

    db.connect(function (err, client, done) {
        if (err) throw err // Mengecet tampilan error koneksi database

        client.query('SELECT * FROM tb_projects WHERE id=$1', [id], function (err, result) {
            let data = result.rows

            data = data.map(function (item) {
                return {
                    ...item,
                    projectName: item.name,
                    description: item.description.slice(0, 150) + '.....',
                    startDate: item.start_date,
                    endDate: item.end_date,
                    duration: durationProject(new Date(item.start_date), new Date(item.end_date)),
                    nodeJs: checkboxes(item.technologies[0]),
                    reactJs: checkboxes(item.technologies[1]),
                    nextJs: checkboxes(item.technologies[2]),
                    typescript: checkboxes(item.technologies[3])
                }
            })
            // console.log(data)
            res.render('edit-project', { project: data })
        })
    })
})

app.post('/update-project/:index', (req, res) => {
    let data = req.body;
    let index = req.params.index
    console.log(index);

    projects[index].projectName = data.projectName;
    projects[index].description = data.description
    projects[index].starDate = data.starDate;
    projects[index].endDate = data.endDate;
    projects[index].duration = durationProject(new Date(data.starDate), new Date(data.endDate));
    projects[index].nodeJs = checkboxes(data.nodeJs);
    projects[index].reactJs = checkboxes(data.reactJs);
    projects[index].nextJs = checkboxes(data.nextJs);
    projects[index].typescript = checkboxes(data.typescript);
    projects[index].image = data.image;


    res.redirect('/')
})

function durationProject(startDate, endDate) {
    let timeStart = startDate;
    let timeEnd = endDate;

    let distance = timeEnd - timeStart;

    let miliseconds = 1000;
    let secondInHours = 3600;
    let hoursInDay = 24;


    let distanceDay = Math.floor(distance / (miliseconds * secondInHours * hoursInDay))
    let distanceWeek = Math.floor(distanceDay / 7)
    let distanceMonth = Math.floor(distanceDay / 30)


    if (distanceMonth > 0) {
        return `${distanceMonth} Bulan`
    } else if (distanceWeek > 0) {
        return `${distanceWeek} Minggu`
    } else if (distanceDay > 0) {
        return `${distanceDay} Hari`
    }

}

function getFullTime(waktu) {

    let month = ['Januari', 'Febuari', 'March', 'April', 'May', 'June', 'July', 'August', 'Sept', 'October', 'November', 'December']

    let date = waktu.getDate()
    // console.log(date);

    let monthIndex = waktu.getMonth()
    // console.log(month[monthIndex]);

    let year = waktu.getFullYear()
    // console.log(year);

    let hours = waktu.getHours()
    let minutes = waktu.getMinutes()

    let dateTime = `${date} ${month[monthIndex]} ${year}`

    let fullTime = `${date} ${month[monthIndex]} ${year} ${hours}:${minutes} WIB`

    return dateTime
}

function checkboxes(condition) {
    if (condition === 'true') {
        return true
    } else {
        return false
    }
}

app.listen(port, function () {
    console.log(`Server Listen on port ${port}`);
})
