const express = require('express')

const app = express()
// const path = require('path')
const port = 5000

// view engine setup 
app.set('view engine', "hbs") // set view engine hbs

app.use('/public', express.static(__dirname + '/public')) // set public path/folder

app.use(express.urlencoded({ extended: false })) // encode / conver

let isLogin = true; // set if user login

let projects = [
    // {
    //     title: "Web Application",
    //     content: "Veniam fugiat nulla minim duis consequat esse id sint irure ea. Dolore culpa laborum est incididunt excepteur non magna. Nostrud reprehenderit non ut aute deserunt ullamco.",
    //     duration: '3 Bulan',
    //     nodeJs: 'fa-brands fa-node',
    //     reactJs: 'fa-brands fa-react',
    //     nextJs: '',
    //     typescript: '',
    //     image: ''
    // }
]

app.get('/', function (req, res) {

    let dataProjects = projects.map(function(item){
        return {
            ...item,
            content: item.content.slice(0, 150) + '.....',
            isLogin: isLogin,
        }
    })
    res.render('index', { login: isLogin, projects: dataProjects })
    
    // console.log(projects);
})

app.get('/delete-project/:index', (req, res) => {
    let index = req.params.index
    projects.splice(index,1)
    res.redirect('/')

})

app.get('/add-project', function (req, res) {
    res.render('add-project')
})

app.get('/contact', function (req, res) {
    res.render('contact')
})

app.get('/detail-project/:index', function (req, res) {
    let index = req.params.index    

    let project = projects[index]

    res.render('detail-project', project)
})

// Add Project
app.post('/add-project', function(req, res){
    // console.log(req.body)

    let data = req.body

    data = {
        title: data.projectName,
        content: data.description,
        startDate: getFullTime(new Date(data.starDate)),
        endDate: getFullTime(new Date(data.endDate)),
        duration: durationProject(new Date(data.starDate), new Date(data.endDate)),
        nodeJs: data.nodeJs,
        reactJs: data.reactJs,
        nextJs: data.nextJs,
        typescript: data.typescript,
        image: data.image
    }

    projects.push(data)

    console.log(projects)
    
    res.redirect('/') // Berpindah Halaman
})


app.post('/contact', function (req, res) {
    let data = req.body
    console.log(data);
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

    let month = ['Januari', 'Febuari', 'March', 'April', 'May', 'June', 'July', 'August', 'Sept', 'October', 'December']

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


app.listen(port, function () {
    console.log(`Server Listen on port ${port}`);
})
