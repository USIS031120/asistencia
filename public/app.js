let obtenerEstudiantes = async() => {
    return new Promise(resolve => {
        fetch("/estudiantes", {

        }).then(res => res.json())
        .then(res => {
            resolve(res);
        });  
    });
}

const alumnos = document.querySelector("#alumnos");

// (async function () {
//     let estudiantes = await obtenerEstudiantes();

// estudiantes.forEach(estudiante => {
//     alumnos.innerHTML += `
//     <tr>
//     <td>${estudiante.nombre}</td>
//     <td>${estudiante.edad}</td>
//     <td>${estudiante.genero}</td>
//     <td><input type="checkbox"></td>
//     <td><input type="checkbox"></td></tr>
//     `;
// });
// document.querySelectorAll("input[type=checkbox]").forEach(elemento => {
//     elemento.addEventListener("change", comprobar);
// });
// })();

let totalMasculino = 0;
let totalFemenino = 0;
let total4anios = 0;
let total5anios = 0;
let total6anios = 0;
let totalMasculino4anios = 0;
let totalFemenino4anios = 0;
let totalMasculino5anios = 0;
let totalFemenino5anios = 0;
let totalMasculino6anios = 0;
let totalFemenino6anios = 0;
let total = 0;
let permisos = 0;

let comprobar = (e) => {
    if (e != undefined) {
        let alumno = e.target.parentNode.parentNode.querySelectorAll("td")[0].innerHTML;
        let asistencia = e.target.parentNode.parentNode.querySelectorAll("input")[0].checked;
        let permiso = e.target.parentNode.parentNode.querySelectorAll("input")[1].checked;
        fetch("/actualizarAsistencia", {
            method: "post",
            body: JSON.stringify({alumno, asistencia, permiso}),
            headers: {"Content-Type": "application/json"}
        });
    }
    let estudiantes = document.querySelectorAll("#alumnos tr");
        totalMasculino = 0;
        totalFemenino = 0;
        total4anios = 0;
        total5anios = 0;
        total6anios = 0;
        totalMasculino4anios = 0;
        totalFemenino4anios = 0;
        totalMasculino5anios = 0;
        totalFemenino5anios = 0;
        totalMasculino6anios = 0;
        totalFemenino6anios = 0;
        total = 0;
        permisos = 0;
    estudiantes.forEach(estudiante => {
        let nombre = estudiante.querySelectorAll("td")[0].innerHTML;
        let edad = estudiante.querySelectorAll("td")[1].innerHTML;
        let genero = estudiante.querySelectorAll("td")[2].innerHTML;
        let asistencia = estudiante.querySelectorAll("input")[0].checked;
        let permiso = estudiante.querySelectorAll("input")[1].checked;

        if (asistencia) {
            if (edad == 4) {
                total4anios++;
            }
            if (edad == 5) {
                total5anios++;
            }
            if (edad == 6) {
                total6anios++;
            }
            if (genero == "M") {
                totalMasculino++;
            }
            if (genero == "F") {
                totalFemenino++;
            }
            if (edad == 4 && genero == "M") {
                totalMasculino4anios++;
            }
            if (edad == 5 && genero == "M") {
                totalMasculino5anios++;
            }
            if (edad == 6 && genero == "M") {
                totalMasculino6anios++;
            }
            if (edad == 4 && genero == "F") {
                totalFemenino4anios++;
            }
            if (edad == 5 && genero == "F") {
                totalFemenino5anios++;
            }
            if (edad == 6 && genero == "F") {
                totalFemenino6anios++;
            }
            total++;
        } else if (permiso) {
            permisos++;
        }
    });
    document.querySelector("#cm").innerHTML = totalMasculino4anios;
    document.querySelector("#cf").innerHTML = totalFemenino4anios;
    document.querySelector("#cim").innerHTML = totalMasculino5anios;
    document.querySelector("#cif").innerHTML = totalFemenino5anios;
    document.querySelector("#sm").innerHTML = totalMasculino6anios;
    document.querySelector("#sf").innerHTML = totalFemenino6anios;
    document.querySelector("#tm").innerHTML = totalMasculino;
    document.querySelector("#tf").innerHTML = totalFemenino;
    document.querySelector("#ct").innerHTML = total4anios;
    document.querySelector("#cit").innerHTML = total5anios;
    document.querySelector("#st").innerHTML = total6anios;
    document.querySelector("#t").innerHTML = total;
    document.querySelector("#permisos").innerHTML = permisos;
}

let btn = document.querySelector("#btn");

btn.addEventListener("click", () => {
    let estudiantes = [];

    let alumnos = document.querySelectorAll("#alumnos tr")

    alumnos.forEach(estudiante => {
        let nombre = estudiante.querySelectorAll("td")[0].innerHTML;
        let edad = estudiante.querySelectorAll("td")[1].innerHTML;
        let genero = estudiante.querySelectorAll("td")[2].innerHTML;
        let asistencia = estudiante.querySelectorAll("input")[0].checked;
        let permiso = estudiante.querySelectorAll("input")[1].checked;

        let alumno = {
            nombre,
            edad,
            genero,
            asistencia,
            permiso
        }

        estudiantes.push(alumno);
    });
    fetch("/exportarEstudiantes", {
        method: "post",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(estudiantes)
    })
    .then(res => res.json())
    .then(res => console.log(res))
})

let fecha = document.querySelector(".fecha");
let btnFecha = document.querySelector(".btn-fecha");

btnFecha.addEventListener("click", () => {
    fetch("/estudiantes", {
        method: "post",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({fecha: fecha.value})
    })
    .then(res => res.json())
    .then(estudiantes => {
        console.log(estudiantes);
        alumnos.innerHTML = "";
        estudiantes.forEach(estudiante => {
            let checkedAsistencia = "";
        let checkedPermiso = "";
        if (estudiante.Asistencia) {
            checkedAsistencia = "checked"
        }
        if (estudiante.Permiso) {
            checkedPermiso = "checked";
        }
                alumnos.innerHTML += `
                <tr>
                <td>${estudiante.alumno[0].nombre}</td>
                <td class="ocultar">${estudiante.alumno[0].edad}</td>
                <td class="ocultar">${estudiante.alumno[0].genero}</td>
                <td><input type="checkbox" ${checkedAsistencia}></td><td><input type="checkbox" ${checkedPermiso}></td></tr>`;
            });
            comprobar();
            document.querySelectorAll("input[type=checkbox]").forEach(elemento => {
                elemento.addEventListener("change", comprobar);
            });
    });
})