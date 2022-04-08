const express = require('express')

const bcrypt = require('bcrypt')
const session = require('express-session')
const flash = require('express-flash')

const app = express()
const port = 5000

const db = require('./connection/db')
const upload = require('./middlewares/fileUpload')
const path = require('path')
const fs = require('fs')

app.set('view engine', "hbs") // set view engine hbs
app.use('/public', express.static(__dirname + '/public')) // set path folder public
app.use('/uploads', express.static(__dirname + '/uploads')) // set path folder upload
app.use(express.urlencoded({ extended: false })) // encode / convert

app.use(flash())

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 2 * 60 * 60 * 1000, // 2 Hour
    }
}))


// GET : INDEX
app.get('/', function (req, res) {

    const query = `SELECT tb_projects.id as project_id, tb_users.id AS author_id, tb_users.name AS author_name, tb_projects.name AS project_name, start_date, end_date, description, technologies, image
    FROM tb_projects LEFT JOIN tb_users ON tb_projects.author_id = tb_users.id`

    db.connect(function (err, client, done) {
        if (err) throw err // Kondisi untuk menampilkan error koneksi database

        if (req.session.isLogin != true) { //! User Belum Login
            client.query(query, function (err, result) {
                if (err) throw err // Kondisi untuk menampilkan error query
                let data = result.rows

                data = data.map(function (item) {
                    return {
                        id: item.project_id,
                        authorId: item.author_id,
                        authorName: item.author_name,
                        projectName: item.project_name,
                        description: item.description.slice(0, 150) + '.....',
                        duration: durationProject(item.start_date, item.end_date),
                        nodeJs: checkboxes(item.technologies[0]),
                        reactJs: checkboxes(item.technologies[1]),
                        laravel: checkboxes(item.technologies[2]),
                        ember: checkboxes(item.technologies[3]),
                        image: item.image,
                        isLogin: req.session.isLogin
                    }
                })
                console.log(data);
                res.render('index', { isLogin: req.session.isLogin, user: req.session.user, project: data })
            })
        } else {
            const authorId = req.session.user.id

            const queryAfterLogin = `SELECT tb_projects.id as project_id, tb_users.id AS author_id, tb_users.name AS author_name, tb_projects.name AS project_name, start_date, end_date, description, technologies, image
            FROM tb_projects LEFT JOIN tb_users ON tb_projects.author_id = tb_users.id
            WHERE author_id = ${authorId}`

            client.query(queryAfterLogin, function (err, result) {
                if (err) throw err // Kondisi untuk menampilkan error query
                let data = result.rows
                done

                data = data.map(function (item) {
                    return {
                        id: item.project_id,
                        authorId: item.author_id,
                        authorName: item.author_name,
                        projectName: item.project_name,
                        description: item.description.slice(0, 150) + '.....',
                        duration: durationProject(item.start_date, item.end_date),
                        nodeJs: checkboxes(item.technologies[0]),
                        reactJs: checkboxes(item.technologies[1]),
                        laravel: checkboxes(item.technologies[2]),
                        ember: checkboxes(item.technologies[3]),
                        image: item.image,
                        isLogin: req.session.isLogin
                    }
                })
                res.render('index', { isLogin: req.session.isLogin, user: req.session.user, project: data })
            })
        }
    })
})



// GET: REGISTER
app.get('/register', (req, res) => {
    res.render('register')
})

// POST: REGISTER   
app.post('/register', (req, res) => {
    let { inputName, inputEmail, inputPassword } = req.body //! destruction
    const hashedPassword = bcrypt.hashSync(inputPassword, 10)

    const querySelect = `SELECT * FROM tb_users WHERE email='${inputEmail}';`
    const queryInsert = `INSERT INTO public.tb_users(name, email, password)
        VALUES ('${inputName}', '${inputEmail}', '${hashedPassword}');`

    db.connect(function (err, client, done) {
        if (err) throw err

        client.query(querySelect, function (err, result) {
            if (err) throw err

            if (result.rows.length != 0) {
                req.flash('danger', 'Email telah terdaftar!')
                return res.redirect('/register')
            } else {
                client.query(queryInsert, function (err, result) { //! Error jika menambahkan email baru
                    if (err) throw err
                    done()
                    req.flash('success', '🥳Akun anda berhasil ditambahkan🥳, \n Silahkan login 👇')
                    return res.redirect('/login')
                })
            }
        })
    })
})



// GET: LOGIN
app.get('/login', (req, res) => {
    res.render('login')
})

// POST : LOGIN
app.post('/login', (req, res) => {
    let { inputEmail, inputPassword } = req.body
    const query = `SELECT * FROM tb_users WHERE email='${inputEmail}';`

    db.connect(function (err, client, done) {
        if (err) throw err

        client.query(query, function (err, result) {
            if (err) throw err
            done()

            if (result.rows.length == 0) {
                req.flash('danger', 'Email Belum Terdaftar')
                return res.redirect('/login')
            }

            let dataUser = result.rows[0] //! data user ditampung di variabel baru
            let isMatch = bcrypt.compareSync(inputPassword, dataUser.password)

            if (isMatch) {
                req.session.isLogin = true,
                    req.session.user = {
                        id: dataUser.id,
                        name: dataUser.name,
                        email: dataUser.email
                    }
                // console.log(dataUser)
                console.log('Berhasil Login');
                req.flash('success', 'Login Success')
                res.redirect('/')
            } else {
                console.log('Password Salah');
                req.flash('warning', 'Password Salah')
                res.redirect('/login')
            }
        })
    })
})



// GET: LOGOUT
app.get('/logout', function (req, res) {
    req.session.destroy()
    res.redirect('/')
})



// GET: DETAIL PROJECT
app.get('/detail-project/:id', function (req, res) {
    const id = req.params.id
    const query = `	SELECT tb_projects.id as project_id, tb_users.id AS author_id, tb_users.name AS author_name, tb_projects.name AS project_name, start_date, end_date, description, technologies, image
    FROM tb_projects LEFT JOIN tb_users ON tb_projects.author_id = tb_users.id
    WHERE tb_projects.id =${id}`

    db.connect(function (err, client, done) {
        if (err) throw err // Mengecek tampilan error koneksi database

        client.query(query, function (err, result) {
            if (err) throw err
            let data = result.rows[0]
            done();

            data = {
                projectName: data.project_name,
                description: data.description,
                startDate: getFullTime(data.start_date),
                endDate: getFullTime(data.end_date),
                duration: durationProject(data.start_date, data.end_date),
                nodeJs: checkboxes(data.technologies[0]),
                reactJs: checkboxes(data.technologies[1]),
                laravel: checkboxes(data.technologies[2]),
                ember: checkboxes(data.technologies[3]),
            }
            console.log('----------Detail Project-----------');
            console.log(data);
            console.log('-----------------------------------');
            res.render('detail-project', { project: data })
        })
    })
})



// GET: ADD PROJECT
app.get('/add-project', function (req, res) {
    if (!req.session.isLogin) {
        req.flash('danger', 'Silahkan Login!!')
        return res.redirect('/login')
    }
    res.render('add-project',)
})

// POST: ADD PROJECT
app.post('/add-project', upload.single('inputImage'), function (req, res) {
    let data = req.body
    const authorId = req.session.user.id
    const image = req.file.filename

    data = {
        projectName: data.projectName,
        description: data.description,
        startDate: data.starDate,
        endDate: data.endDate,
        nodeJs: checkboxes(data.nodeJs),
        reactJs: checkboxes(data.reactJs),
        laravel: checkboxes(data.laravel),
        ember: checkboxes(data.ember)
    }

    const query = `INSERT INTO public.tb_projects(
        author_id, name, start_date, end_date, description, technologies, image)
        VALUES ('${authorId}', '${data.projectName}', '${data.startDate}', '${data.endDate}', '${data.description}', '{"${data.nodeJs}","${data.reactJs}","${data.laravel}","${data.ember}"}' , '${image}');`


    db.connect(function (err, client, done) {
        if (err) throw err

        client.query(query, function (err, result) {
            if (err) throw err
            done()

            res.redirect('/') // berpindah halaman ke route /index
        })
    })
})



// GET : EDIT PROJECT
app.get('/edit-project/:id', (req, res) => {
    const id = req.params.id

    const query = `SELECT * FROM tb_projects WHERE id=${id}`

    db.connect(function (err, client, done) {
        if (err) throw err // Mengecek tampilan error koneksi database

        client.query(query, function (err, result) {
            if (err) throw err
            let data = result.rows[0]
            done();

            data = {
                id: id, //! harus ada
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



// GET: DELETE PROJECT
app.get('/delete-project/:id', (req, res) => {
    const id = req.params.id

    const querySelect = `SELECT image FROM tb_projects WHERE tb_projects.id =${id};`

    db.connect(function (err, client, done) {
        if (err) throw err // Kondisi untuk menampilkan error koneksi database

        client.query(querySelect, function (err, result) {
            if (err) throw err // Kondisi untuk menampilkan error query
            let data = result.rows[0].image

            const removeImage = (filePath) => {
                console.log('filePath: ', filePath)
                console.log('dir name: ', __dirname)

                filePath = path.join(__dirname, '/uploads', filePath)
                fs.unlink(filePath, err => console.log(err))
            }
            removeImage(data)
        })

        const queryDelete = `DELETE FROM tb_projects WHERE tb_projects.id=${id};`
        client.query(queryDelete, function (err, result) {
            if (err) throw err // Kondisi untuk menampilkan error query
            let data = result.rows
            done()
            console.log(data)
            res.redirect('/')
        })
    })
})


// POST: UPDATE PROJECT
app.post('/update-project/:id', upload.single('inputImage'), (req, res) => {
    let data = req.body
    let id = req.params.id
    const image = req.file.filename

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

    const query = `UPDATE tb_projects 
    SET name='${data.projectName}', start_date='${data.startDate}', end_date='${data.endDate}', description='${data.description}', technologies='{"${data.nodeJs}","${data.reactJs}","${data.laravel}","${data.ember}"}', image='${image}'
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



// GET: CONTACT
app.get('/contact', function (req, res) {
    res.render('contact')
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
    } else {
        return false
    }
}

app.listen(port, function () {
    console.log(`Server Listen on port ${port}`);
})