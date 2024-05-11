let fecha = document.querySelector("#fecha");

let botonCargar = document.querySelector(".boton");

botonCargar.addEventListener("click", () => {
    console.log(fecha.value);
    if (fecha.value == "") return
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

let checkAsistencia = (checkbox, select) => {
    
    if (checkbox.checked) {
        // console.log(event.target.ParentNode)
        // console.log(select)
        // let tre = event.target.ParentNode.ParentNode;
        // let select = tr.querySelector("td:last-child .select");
        select.classList.add("activo")
    } else {
        // let td = tr.querySelector("td:last-child");
        // let select = tr.querySelector("td:last-child .select");
        select.classList.remove("activo")
    }

    // console.log(event)
    // return `<td>
    // <select>
    //     <option value="."></option>
    // </select>
    // </td>`
    // if (asistencia == "SP") {
    //     return "<td><input type='checkbox' class='asistio'></td><td><input type='checkbox' class='permiso'></td><td><input type='checkbox' class='permiso' checked></td>"
    // }
    // if (asistencia == ".") {
    //     return "<td><input type='checkbox' class='asistio' checked></td><td><input type='checkbox' class='permiso'></td><td><input type='checkbox' class='permiso'></td>"
    // }
    // if (asistencia == "P") {
    //     return "<td><input type='checkbox' class='asistio'></td><td><input type='checkbox' class='permiso' checked></td><td><input type='checkbox' class='sinpermiso'></td>"
    // } else {
    //     return "<td><input type='checkbox' class='asistio'></td><td><input type='checkbox' class='permiso'></td><td><input type='checkbox' class='sinpermiso'></td>"
    // }
}

let total = 0;

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
    // let total = 0;
    let totalf6 = 0;
    let total6 = 0;

    let datos = {
        total: 0,
        m4: 0,
        f4: 0,
        totalm: 0,
        totalf: 0,
        m5: 0,
        f5: 0,
        total5: 0,
        total4: 0,
        m6: 0,
        total6: 0,
        f6: 0
    }


    let datosA = {...datos}
    let datosP = {...datos}
    let datosSP = {...datos}
    

    let asistencia = tabla.querySelectorAll("tr");
    let asistenciaV = (chekcboxA, selectA) => {
       if (chekcboxA.checked == false) {
            return 1;
       } else if (selectA.value == "P") {
            return 2;
       } else {
            return 3;
       }
    }
    asistencia.forEach(elemento => {
        let checkboxasistencia = elemento.querySelectorAll("input")[0];
        let selectAsistncia = elemento.querySelector(".select");
        let status = "";

        // let checkboxpermiso = elemento.querySelectorAll("input")[1];
        // let checkboxsinpermiso = elemento.querySelectorAll("input")[2];
        // if (checkboxasistencia.checked == false) {

            total++;

            let edad = elemento.querySelectorAll("td")[1].innerHTML;

            if (edad == "4") {
                if (asistenciaV(checkboxasistencia, selectAsistncia) == 1) {
                    datosA.total4++;
                } else if (asistenciaV(checkboxasistencia, selectAsistncia) == 2) {
                    datosP.total4++;
                } else {
                    datosSP.total4++;
                }
                // total4++;
                let genero = elemento.querySelectorAll("td")[2].innerHTML;

                if (genero == "M") {
                    if (asistenciaV(checkboxasistencia, selectAsistncia) == 1) {
                        datosA.m4++;
                    } else if (asistenciaV(checkboxasistencia, selectAsistncia) == 2) {
                        datosP.m4++;
                    } else {
                        datosSP.m4++;
                    }
                    // totalm4++;
                } else if(genero == "F") {
                    // totalf4++;
                    if (asistenciaV(checkboxasistencia, selectAsistncia) == 1) {
                        datosA.f4++
                    }
                    else if (asistenciaV(checkboxasistencia, selectAsistncia) == 2) {
                        datosP.f4++;
                    } else {
                        datosSP.f4++;
                    }
                }
            } else if (edad == "5") {
                let genero = elemento.querySelectorAll("td")[2].innerHTML;
                // total5++;
                if (asistenciaV(checkboxasistencia, selectAsistncia) == 1) {
                    datosA.total5++;
                } else if (asistenciaV(checkboxasistencia, selectAsistncia) == 2) {
                    datosP.total5++;
                } else {
                    datosSP.total5++;
                }
                 if (genero == "M") {
                    totalm5++;
                    if (asistenciaV(checkboxasistencia, selectAsistncia) == 1) {
                        datosA.m5++;
                    } else if (asistenciaV(checkboxasistencia, selectAsistncia) == 2) {
                        datosP.m5++;
                    } else {
                        datosSP.m5++;
                    }
                } else if(genero == "F") {
                    // totalf5++;
                    if (asistenciaV(checkboxasistencia, selectAsistncia) == 1) {
                        datosA.f5++;
                    } else if (asistenciaV(checkboxasistencia, selectAsistncia) == 2) {
                        datosP.f5++;
                    } else {
                        datosSP.f5++;
                    }
                }
            } else if (edad == "6") {
                total6++;
                let genero = elemento.querySelectorAll("td")[2].innerHTML;
                if (asistenciaV(checkboxasistencia, selectAsistncia) == 1) {
                    datosA.total6++;
                } else if (asistenciaV(checkboxasistencia, selectAsistncia) == 2) {
                    datosP.total6++;
                } else {
                    datosSP.total6++;
                }
                if (genero == "M") {
                    totalm6++;
                    if (asistenciaV(checkboxasistencia, selectAsistncia) == 1) {
                        datosA.m6++;
                    } else if (asistenciaV(checkboxasistencia, selectAsistncia) == 2) {
                        datosP.m6++;
                    } else {
                        datosSP.m6++;
                    }
                } else if(genero == "F") {
                    totalf6++;
                    if (asistenciaV(checkboxasistencia, selectAsistncia) == 1) {
                        datosA.f6++;
                    } else if (asistenciaV(checkboxasistencia, selectAsistncia) == 2) {
                        datosP.f6++;
                    } else {
                        datosSP.f6++;
                    }
                }
            }

            let genero = elemento.querySelectorAll("td")[2].innerHTML;
            if (genero == "M") {
                totalm++;
                if (asistenciaV(checkboxasistencia, selectAsistncia) == 1) {
                    datosA.totalm++;
                } else if (asistenciaV(checkboxasistencia, selectAsistncia) == 2) {
                    datosP.totalm++;
                } else {
                    datosSP.totalm++;
                }
            } else if(genero == "F") {
                totalf++;
                if (asistenciaV(checkboxasistencia, selectAsistncia) == 1) {
                    datosA.totalf++;
                } else if (asistenciaV(checkboxasistencia, selectAsistncia) == 2) {
                    datosP.totalf++;
                } else {
                    datosSP.totalf++;
                }
            }
        // } else {
            let select = elemento.querySelector(".select");
            if (select.value == "P") {

            }
        // }
    })
    datosA.total = datosA.total4 + datosA.total5 + datosA.total6;
    datosP.total = datosP.total4 + datosP.total5 + datosP.total6;
    datosSP.total = datosSP.total + datosSP.total5 + datosSP.total6;

    let t;
    // if (checkboxasistencia.checked == true) {
        t = document.querySelector("#asistencia");
        colocarDatos(t, datosA);
    // } else if (asis == 1) {
        t = document.querySelector("#permiso");
        colocarDatos(t, datosP);
    // } else if (asis == 2) {
        t = document.querySelector("#sinpermiso");
        colocarDatos(t, datosSP);
    // }
}
const colocarDatos = (t, datos) => {

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

    tabla4.innerHTML = datos.total4;
    tabla5.innerHTML = datos.total5;
    tabla6.innerHTML = datos.total6;
    tablam.innerHTML = datos.totalm;
    tablaf.innerHTML = datos.totalf;
    tablam4.innerHTML = datos.m4;
    tablam5.innerHTML = datos.m5;
    tablam6.innerHTML = datos.m6;
    tablaf4.innerHTML = datos.f4;
    tablaf5.innerHTML = datos.f5;
    tablaf6.innerHTML = datos.f6;
    tablat.innerHTML = datos.total;
}


let limpiar = () => {
    let tabla = document.querySelector(".table tbody");
    tabla.innerHTML = "";
}

let btnGuardar = document.querySelector(".guardar")


let actualizarDatos = (data) => {
    let tabla = document.querySelector(".table tbody");
    limpiar();
    data.forEach(estudiante => {
        let tr = document.createElement("tr");
        tabla.appendChild(tr);
        
        tr.innerHTML += `
        <td>${estudiante.nombres} ${estudiante.apellidos}</td>
        <td>${estudiante.edad}</td>
        <td>${estudiante.genero}</td>
        `
        
        let tdCheckbox = document.createElement("td");
        let asistenciaChk = document.createElement("input");
        asistenciaChk.setAttribute("type", "checkbox");
        // console.log(estudiante.asistencia)
        asistenciaChk.checked = (estudiante.asistencia == ".") ? false : true;
        // asistenciaChk.checked = true;
        let tdSelect = document.createElement("td");
        asistenciaChk.addEventListener("click", event => checkAsistencia(asistenciaChk, selectAsistencia));
        tdCheckbox.appendChild(asistenciaChk);
        tr.appendChild(tdCheckbox);
        
        let selectAsistencia = document.createElement("select");
        selectAsistencia.className = "select";
        let selectOptionPermiso = document.createElement("option");
        selectOptionPermiso.value = "P";
        selectOptionPermiso.text = "Permiso";
        let selectOptionSinPermiso = document.createElement("option");
        selectOptionSinPermiso.value = "SP";
        selectOptionSinPermiso.text = "Sin Permiso";
        selectAsistencia.appendChild(selectOptionPermiso);
        selectAsistencia.appendChild(selectOptionSinPermiso);
        selectAsistencia.value = estudiante.asistencia;

        if (estudiante.asistencia == "P") {
            selectAsistencia.value = "P"
        } else {
            selectAsistencia.value = "SP"
        }
        // selectAsistencia.disabled = (estudiante.asistencia == "." || estudiante.asistencia == "SP") ? true : false;
        tdSelect.appendChild(selectAsistencia);
        tr.appendChild(tdSelect);


        checkAsistencia(asistenciaChk, selectAsistencia)

        let tdId = document.createElement("td");
        tdId.innerHTML = estudiante.id;
        tdId.classList.add("d-none")
        tr.appendChild(tdId);
        // tr.innerHTML += `<td class='id d-none'>${estudiante.id}</td>`;
    });
    calcularAsisntecia(0);
    // calcularAsistencia(1);
    // calcularAsistencia(2);

}

let actualizarAsistencia = () => {
    let tabla = document.querySelector(".table");
    let estudiantes = document.querySelectorAll(".asistencia tbody tr");
    
    
    let datos = [];
    estudiantes.forEach((element) => {
        let elementos = element.querySelectorAll("td");
        let id = element.querySelector("td:last-child").innerHTML;
        // console.log(id)
        asistio = elementos[3].querySelector("input").checked;
        permiso = elementos[4].querySelector("select").value;
        // sinpermiso = elementos[5].querySelector("input").checked;
        datos.push({id, asistio, permiso})
    })
    console.log(datos);
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