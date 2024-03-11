let fecha = document.querySelector("#fecha");

fecha.addEventListener("change", () => {
    console.log(fecha.value);
    let fecha2 = new Date(fecha.value).getDay();
    if (fecha2 == 5 || fecha2 == 6) {
        let alert = document.querySelector(".alert");
        alert.classList.remove("d-none")
        return;
    }
    let date = fecha.value;
    fetch("/estudiantes", {
        method: "post",
        body: JSON.stringify({fecha: date}),
        headers:{"Content-Type": "application/json"}
    })
    .then(res => res.json())
    .then(data => {
        console.log(data)
        actualizarDatos(data.result)
    })
})

let checkAsistencia = (asistencia) => {
    if (asistencia == "SP") {
        return "<td><input type='checkbox' class='asistio'></td><td><input type='checkbox' class='permiso'></td><td><input type='checkbox' class='permiso' checked></td>"
    }
    if (asistencia == ".") {
        return "<td><input type='checkbox' class='asistio' checked></td><td><input type='checkbox' class='permiso'></td><td><input type='checkbox' class='permiso'></td>"
    }
    if (asistencia == "p") {
        return "<td><input type='checkbox' class='asistio'></td><td><input type='checkbox' class='permiso' checked></td><td><input type='checkbox' class='sinpermiso'></td>"
    }
}

let calcularAsisntecia = (asis) => {
    let tabla = document.querySelector(".asistencia tbody");
    let totalm4 = 0;
    let totalf4 = 0
    let totalm = 0;
    let totalf = 0;
    let totalm5 = 0;
    let totalf5 = 0;
    let total5 = 0;
    let total4 = 0;
    let totalm6 = 0;
    let total = 0;
    let totalf6 = 0;
    let total6 = 0;

    let asistencia = tabla.querySelectorAll("tr");
    asistencia.forEach(elemento => {
        let checkboxasistencia = elemento.querySelectorAll("input")[asis];
        let checkboxpermiso = elemento.querySelectorAll("input")[1];
        let checkboxsinpermiso = elemento.querySelectorAll("input")[2];
        if (checkboxasistencia.checked) {
            total++;

            let edad = elemento.querySelectorAll("td")[1].innerHTML;

            if (edad == "4") {
                total4++;
                let genero = elemento.querySelectorAll("td")[2].innerHTML;

                if (genero == "M") {
                    totalm4++;
                } else if(genero == "F") {
                    totalf4++;
                }
            } else if (edad == "5") {
                let genero = elemento.querySelectorAll("td")[2].innerHTML;
                total5++;
                 if (genero == "M") {
                    totalm5++;
                } else if(genero == "F") {
                    totalf5++;
                }
            } else if (edad == "6") {
                total6++;
                let genero = elemento.querySelectorAll("td")[2].innerHTML;
                
                if (genero == "M") {
                    totalm6++;
                } else if(genero == "F") {
                    totalf6++;
                }
            }

            let genero = elemento.querySelectorAll("td")[2].innerHTML;
            if (genero == "M") {
                totalm++;
            } else if(genero == "F") {
                totalf++;
            }
        }
    })
    let t;
    if (asis == 0) {
        t = document.querySelector("#asistencia");
    } else if (asis == 1) {
        t = document.querySelector("#permiso");
    } else if (asis == 2) {
        t = document.querySelector("#sinpermiso");
    }
    
    let tabla4 = t.querySelector(".t4");
    let tablam4 = t.querySelector(".m4");
    let tablam5 = t.querySelector(".m5");
    let tablam6 = t.querySelector(".m6");
    let tablaf4 = t.querySelector(".f4");
    let tablaf5 = t.querySelector(".f5");
    let tablaf6 = t.querySelector(".f6");
    let tabla5 = t.querySelector(".t5");
    let tabla6 = t.querySelector(".t6");
    let tablam = t.querySelector(".tm");
    let tablaf = t.querySelector(".tf");
    let tablat = t.querySelector(".tt");

    tabla4.innerHTML = total4;
    tabla5.innerHTML = total5;
    tabla6.innerHTML = total6;
    tablam.innerHTML = totalm;
    tablaf.innerHTML = totalf;
    tablam4.innerHTML = totalm4;
    tablam5.innerHTML = totalm5;
    tablam6.innerHTML = totalm6;
    tablaf4.innerHTML = totalf4;
    tablaf5.innerHTML = totalf5;
    tablaf6.innerHTML = totalf6;
    tablat.innerHTML = total;
}

let limpiar = () => {
    let tabla = document.querySelector(".table tbody");
    tabla.innerHTML = "";
}

let btnGuardar = document.querySelector(".guardar")


let actualizarDatos = (data) => {
    let tabla = document.querySelector(".table tbody");
    limpiar()
    data.forEach(estudiante => {
        tabla.innerHTML += `<td>${estudiante.nombres} ${estudiante.apellidos}</td>
        <td>${estudiante.edad}</td>
        <td>${estudiante.genero}</td>
        ${checkAsistencia(estudiante.asistencia)}
        <td class='id d-none'>${estudiante.id}</td>
        `
    });
    calcularAsisntecia(0);
    calcularAsisntecia(1);
    calcularAsisntecia(2);

}

let actualizarAsistencia = () => {
    let tabla = document.querySelector(".table");
    let estudiantes = document.querySelectorAll(".asistencia tbody tr");
    
    
    let datos = [];
    estudiantes.forEach((element) => {
        let elementos = element.querySelectorAll("td");
        let id = elementos[6].innerHTML;
        asistio = elementos[3].querySelector("input").checked;
        permiso = elementos[4].querySelector("input").checked;
        sinpermiso = elementos[5].querySelector("input").checked;
        datos.push({id, asistio, permiso, sinpermiso})
    })
    
    fetch("/actualizarAsistencia", {
        method: "post",
        body: JSON.stringify(datos),
        headers: { 'Content-Type': 'application/json' }
    })
    .then(data => data.text())
    .then(res => console.log(res));
    calcularAsisntecia(0);
    calcularAsisntecia(1);
    calcularAsisntecia(2);
    
}
let btnExportar = document.querySelector(".exportar");

// btnExportar.addEventListener("click", () => {
//     let mes = document.querySelector("#mes2").value;
//     fetch("http://localhost:3000/exportarEstudiantes", {
//         method: "post",
//         body: JSON.stringify({mes: mes}),
//         headers: {'Content-Type': 'application/json' }
//     })
//     .then(data => data.json())
//     .then(data => console.log(data))
// })
btnGuardar.addEventListener("click", actualizarAsistencia)