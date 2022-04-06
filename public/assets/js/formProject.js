let projects = [];

function addProject(event) {
    event.preventDefault(); // Mencegah reload

    let projectName = document.getElementById('projectName').value;
    let startDate = document.getElementById('startDate').value;
    let endDate = document.getElementById('endDate').value;
    let description = document.getElementById('description').value;
    // Sosmed
    let nodeJs = document.getElementById('nodeJs').checked;
    let reactJs = document.getElementById('reactJs').checked;
    let nextJs = document.getElementById('nextJs').checked;
    let typescript = document.getElementById('typescript').checked;

    (nodeJs) ? nodeJs = document.getElementById('nodeJs').value : nodeJs = '';
    (reactJs) ? reactJs = document.getElementById('reactJs').value : reactJs = '';
    (nextJs) ? nextJs = document.getElementById('nextJs').value : nextJs = '';
    (typescript) ? typescript = document.getElementById('typescript').value : typescript = '';

    let image = document.getElementById('inputImage').files;

    image = URL.createObjectURL(image[0]); // Untuk menampilkan gambar

    let project = {
        projectName: projectName,
        description: description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        nodeJs: nodeJs,
        reactJs: reactJs,
        nextJs: nextJs,
        typescript: typescript,
        image: image
    };

    projects.push(project);
    renderProject();
}

function renderProject() {
    document.getElementById('project-card-list').innerHTML = ``;

    for (let dataProject = 0; dataProject < projects.length; dataProject++) {
        document.getElementById('project-card-list').innerHTML +=
            `
        <!-- Project-Card -->
            <div class="project-card">
                <img src="${projects[dataProject].image}" alt="Project Image">
                <h4 class="project-name">
                    <a href="detail-project.html">${projects[dataProject].projectName}</a>
                </h4>
                <p class="duration">Durasi : ${durationProject(projects[dataProject].startDate, projects[dataProject].endDate)}</p>

                <p class="description">${projects[dataProject].description.slice(0, 125)}.....</p>

                <!-- Icon-Project -->
                <i class="${projects[dataProject].nodeJs}"></i>
                <i class="${projects[dataProject].reactJs}"></i>
                <i class="${projects[dataProject].nextJs}"></i>
                <i class="${projects[dataProject].typescript}"></i>
                <!-- End Icon-Project -->

                <!-- Button-Project -->
                <div class="button-project">
                    <button class="btn-aksi">edit</button>
                    <button class="btn-aksi">delete</button>
                </div>
                <!-- End Button-Project -->
            </div>
            <!-- End Project-Card -->
        
        `
    }

    // function getFullTime(waktu) {
    //     let month = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    //     let date = waktu.getDate();

    //     // let monthIndex = waktu.getMonth()
    //     // console.log(month[monthIndex]);

    //     let year = waktu.getFullYear()
    //     // console.log(year);

    //     let hours = waktu.getHours();
    //     let minutes = waktu.getMinutes();

    //     let fullTime = `${date} ${month[monthIndex]} ${year} ${hours}:${minutes}`

    //     return fullTime;
    // }

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


        // Eksperiment 

        // if (distanceMonth > 0) {
        //     let day = distanceDay - (distanceMonth * 30) 
        //     let week = distanceWeek - (distanceMonth * 4) 
        //     console.log("Distance Month :", distanceMonth);
        //     console.log("Distance Week :", distanceWeek);
        //     console.log("Distance Day :", distanceDay);

        //     console.log("day :", day);
        //     console.log("week :",week);
        //     if (week < 4) {
        //         if (day <= 7) {
        //             return `${distanceMonth} Bulan ${week} Minggu ${day} Hari`
        //         }else{
        //             return `${distanceMonth} Bulan ${week} Minggu`
        //         }
        //     }
        //     return `${distanceMonth} Bulan`
        // } else if (distanceWeek > 0) {
        //     // let day = distanceDay - ( distanceWeek * distanceDay)
        //     // if(day <= 7){
        //     //     return `${distanceWeek} Minggu ${distanceDay} Hari`
        //     // }
        //     return `${distanceWeek} Minggu`
        // } else if (distanceDay > 0) {
        //     return `${distanceDay} Hari`
        // }


    }

}