const express = require("express");
const app = express();
const exceljs = require("exceljs");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const mysql = require("mysql");
const util = require("util");
dotenv.config();
const port = process.env.PORT || 3000;

const confg = {
    host     : process.env.HOST,
    user     : process.env.USER,
    password : process.env.PASSWORD,
    database : process.env.DB,
    timeout: 30000
};

let connection;


function handleDisconnect() {
  connection = mysql.createConnection(confg); // Recreate the connection, since
                                                  // the old one cannot be reused.

  connection.connect(function(err) {              // The server is either down
    if(err) {                                     // or restarting (takes a while sometimes).
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    }                                     // to avoid a hot loop, and to allow our node script to
  });                                     // process asynchronous requests in the meantime.
                                          // If you're also serving http, display a 503 error.
  connection.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      handleDisconnect();                         // lost due to either server restart, or a
    } else {                                      // connnection idle timeout (the wait_timeout
      throw err;                                  // server variable configures this)
    }
  });
}
handleDisconnect();
// connection.connect();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({extended: true}))

let query = util.promisify(connection.query).bind(connection);

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

app.post("/estudiantes", async (req, res) => {
    // res.send(estudiantes);
    let fecha = req.body.fecha;
    console.log(fecha);

    let result = await query("select * from asistencia where fecha = ?", [fecha])
    if (result.length == 0) {
        let result = await query("select * from estudiantes")
                    
        await result.forEach(async estudiante => {
            await query("insert into asistencia values (null, ?, ?, '')", [estudiante.id, fecha]);
        })
        result = await query("select estudiantes.nombres, estudiantes.apellidos, estudiantes.edad, estudiantes.genero, asistencia.id, asistencia.asistencia from asistencia inner join estudiantes on asistencia.idalumno = estudiantes.id where asistencia.fecha = ? order by estudiantes.edad, estudiantes.apellidos", [fecha])
        res.send({result})
            
    } else {
        let result = await query("select estudiantes.nombres, estudiantes.apellidos, estudiantes.edad, estudiantes.genero, asistencia.id, asistencia.asistencia from asistencia inner join estudiantes on asistencia.idalumno = estudiantes.id where asistencia.fecha = ? order by estudiantes.edad, estudiantes.apellidos", [fecha])
        res.send({result})
    }

});

app.post("/exportarEstudiantes", async (req, res) => {

    let mes = req.body.mes2;

    

    
    let workbook = new exceljs.Workbook();
    let exportarexcel = async (edad) => {

    // Consulta para obtener los nombres de los estudiantes y la asistencia
    let query1 = "SELECT estudiantes.nombres, estudiantes.genero, estudiantes.apellidos, estudiantes.edad, asistencia.fecha, asistencia.asistencia FROM estudiantes JOIN asistencia ON estudiantes.id = asistencia.idAlumno WHERE MONTH(asistencia.fecha) = ? AND estudiantes.edad = ? ORDER BY estudiantes.apellidos ASC";
    
    // Crear nuevo libro de Excel y hoja de trabajo
    console.log(mes);
    let worksheet4Years = workbook.addWorksheet(edad.toString() + ' años');
    // ... Agrega más hojas según sea necesario
    
    let results = await query(query1, [mes, edad]); // Ejemplo para octubre
      // Procesa los resultados aquí y completa la hoja de Excel según sea necesario.
      // Esto es solo básico; es posible que debas ajustar según tus requisitos exactos.
      
      results.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
      let fechas = [];
      let semanas = [];
      fechas = results.map(asistencia => {
        return new Date(asistencia.fecha).getDate();
      })
      let fechas2 = results.map(asistencia => {
        return asistencia.fecha
      })
      console.log(semanas)
      fechas = fechas.filter((item, index)=> {
        return fechas.indexOf(item) == index;
      })
      fechas2 = fechas2.filter((item, index)=> {
        return fechas2.indexOf(item) == index;
      })
      console.log(results);

      console.log(fechas2);
      fechas2.forEach((item, index) => {
        let s = new Date(item).getDay();
        console.log(s)
        let w = "";
        switch(s){
          case 1:
            w = "L";
            break;
          case 2:
            w = "M";
            break;
          case 3:
            w = "M";
            break;
          case 4:
            w = "J";
            break;
          case 5:
            w = "V";
            break;
        }
        semanas.push(w);
      })

      let nombres = "";
      let estudiantes = [];
      let contador = -1;
      const asistenciaAgrupada = {};

      // Iterar sobre el array original
      results.forEach(asistencia => {

        const { nombres, apellidos, asistencia: estadoAsistencia, fecha } = asistencia;
      
        // Comprobar si el estudiante ya tiene un objeto en el nuevo objeto
        if (!asistenciaAgrupada[nombres]) {
          // Si no existe, crear un nuevo objeto con el nombre del estudiante
          asistenciaAgrupada[nombres] = [
            nombres + " " + apellidos,
            asistencia.genero
          ];
        }
    

        asistenciaAgrupada[nombres].push(estadoAsistencia);
      });


      
      let totalgenerom = 0;
      let totalgenerof = 0;
      const asistenciaAgrupadaArray = Object.values(asistenciaAgrupada);
      
      let total = [];
      let totaldiaasistencia = [];
      let totaldiapermiso = [];
      let totaldiasinpermiso = [];
      asistenciaAgrupadaArray.forEach((asistencia, index) => {
        let suma = 0;
        let sumadiariaasistencia = 0;
        asistencia.forEach((alumno, numero) => {
          if (numero != 0 && alumno == ".") {
            suma++;
          }
          if (numero != 0){ 
            if (totaldiaasistencia[numero - 1] == undefined) {
              totaldiaasistencia[numero - 1] = 0;
            }
            if (totaldiapermiso[numero - 1] == undefined) {
              totaldiapermiso[numero - 1] = 0;
            }
            if (totaldiasinpermiso[numero - 1] == undefined) {
              totaldiasinpermiso[numero - 1] = 0;
            }
            if (alumno == "." ) {
              totaldiaasistencia[numero - 1] += 1;

            }
            if (alumno == "P") {
              totaldiapermiso[numero - 1] += 1; 
            }
            if (alumno == "SP") {
              totaldiasinpermiso[numero - 1] += 1; 
            }
          }
          
          let total1 = []
        })
        if (asistencia[1] == "M") {
          total.push([suma, ""]);
          totalgenerom += suma;
        } else {
          total.push(["", suma]);
          totalgenerof += suma;
        }
        asistencia.splice(1,1);
      })
      console.log(asistenciaAgrupadaArray);
      console.log(estudiantes);
    

      let totalmatricula1 = [];
      totaldiaasistencia.splice(0,1);
      totaldiapermiso.splice(0,1);
      totaldiasinpermiso.splice(0,1);

      totaldiaasistencia.forEach((asistencia2, index) => {
        if (totalmatricula1[index] == undefined) {
          totalmatricula1[index] = 0;
        }
        totalmatricula1[index] = totaldiaasistencia[index] + totaldiapermiso[index] + totaldiasinpermiso[index];
      })
      
      let totalasistencia2 = 0;
      let totalpermiso = 0;
      let totalsinpermiso = 0;
      console.log(totaldiaasistencia);

      totaldiaasistencia.forEach(asistencia1 => {
        totalasistencia2+=asistencia1;
      });

      totaldiapermiso.forEach(asistencia1 => {
        totalpermiso+=asistencia1;
      });

      totaldiasinpermiso.forEach(asistencia1 => {
        totalsinpermiso+=asistencia1;
      });

      let totaldias2 = totalasistencia2 + totalpermiso + totalsinpermiso;
      
      let mediaAsistenciaM = 0;
      let mediaAsistenciaF = 0;

      let totaldias = fechas.length;



      mediaAsistenciaM = Math.round(totalgenerom / totaldias);
      mediaAsistenciaF = Math.round(totalgenerof / totaldias);

      let totalasitenciam = 0;
      let alumnos1 = [];
      let totalmasculino = await query("select count(id) from estudiantes where genero = 'M'");
      let totalfemenino = await query("select count(id) from estudiantes where genero = 'F'");

      totalmasculino = totalmasculino[0]["count(id)"];
      totalfemenino = totalfemenino[0]["count(id)"];

      let totalmasculinoporasistencia = totalmasculino * totaldias;
      let totalfemeninoporasistencia = totalfemenino * totaldias
      let inasistenciam = Math.round((totalmasculinoporasistencia - totalgenerom) / totaldias);
      let inasistenciaf = Math.round((totalfemeninoporasistencia - totalgenerof) / totaldias);
      
      console.log(total);
      worksheet4Years.columns = [
        {header: "N°", width: 4, style: {font: {size: 13}}},
        {header: "Estudiantes", width: 30, style: {font: {size: 13}}}
      ]
      let contador3 = 0;
      let contador2 = 0;

      fechas.forEach((fecha, numero) => {
        worksheet4Years.getCell(`2`,`${numero + 3}`).value = fecha;
        worksheet4Years.getColumn(numero + 3).alignment = {horizontal: "center", vertical: "middle"}
        worksheet4Years.getColumn(numero + 3).width = 4;
        worksheet4Years.getColumn(numero + 3).font = {name: "Calibri", size: 13};
        worksheet4Years.getCell(`2`,`${numero + 3}`).border = {
          top: {style: "thin"},
          left: {style: "thin"},
          right: {style: "thin"},
          bottom: {style: "thin"}
        }
      })

      
      semanas.forEach((semana, numero) => {
        worksheet4Years.getCell(`1`, `${numero + 3}`).value = semana;
        contador2++;
        worksheet4Years.getCell(`1`,`${numero + 3}`).border = {
          top: {style: "thin"},
          left: {style: "thin"},
          right: {style: "thin"},
          bottom: {style: "thin"}
          
        }
      })
      worksheet4Years.getCell(`A2`).merge(worksheet4Years.getCell("A1"));
      worksheet4Years.getCell(`B2`).merge(worksheet4Years.getCell("B1"));
      total.forEach((asistencia, index) => {
        asistencia.forEach((total2, numero) => {
          worksheet4Years.getCell(index + 3,`${contador2 + 3 + numero}`).value = total2;
          worksheet4Years.getCell(index + 3,`${contador2 + 3 + numero}`).border = {
            top: {style: "thin"},
            left: {style: "thin"},
            right: {style: "thin"},
            bottom: {style: "thin"}
            
          }
        })
      })
      worksheet4Years.getCell(`2`, `${contador2 + 3}`).value = "M";
      worksheet4Years.getCell(`2`,`${contador2 + 3}`).border = {
        top: {style: "thin"},
        left: {style: "thin"},
        right: {style: "thin"},
        bottom: {style: "thin"}
        
      }
      worksheet4Years.getColumn(contador2 + 3).font = {size: 13};
      worksheet4Years.getCell(`2`, `${contador2 + 4}`).value = "F";
      worksheet4Years.getCell(`2`,`${contador2 + 4}`).border = {
        top: {style: "thin"},
        left: {style: "thin"},
        right: {style: "thin"},
        bottom: {style: "thin"}
        
      }
      worksheet4Years.getColumn(contador2 + 3).width = 4;
      worksheet4Years.getColumn(contador2 + 4).width = 4;
      worksheet4Years.getColumn(contador2 + 4).font = {size: 13};
      worksheet4Years.getCell(`1`, `${contador2 + 3}`).value = "Total";
      worksheet4Years.getCell(`1`,`${contador2 + 3}`).border = {
        top: {style: "thin"},
        left: {style: "thin"},
        right: {style: "thin"},
        bottom: {style: "thin"}
        
      }
      worksheet4Years.getCell(`1`, `${contador2 + 4}`).merge(worksheet4Years.getCell(`1`,`${contador2 + 3}`));
      asistenciaAgrupadaArray.forEach((row, index) => {
        contador3++;
        worksheet4Years.getCell(`A${index + 3}`).value = index + 1;
        worksheet4Years.getCell(`A${index + 3}`).border = {
          top: {style: "thin"},
          left: {style: "thin"},
          right: {style: "thin"},
          bottom: {style: "thin"}
        }
        row.forEach((estudiante, numero) => {
          worksheet4Years.getCell(`${index + 3}`,`${numero + 2}`).value = estudiante;
          worksheet4Years.getCell(`${index + 3}`,`${numero + 2}`).border = {
            top: {style: "thin"},
            left: {style: "thin"},
            right: {style: "thin"},
            bottom: {style: "thin"}
            
          }
        });
      });
      worksheet4Years.getCell("A1:O7").border = {
        top: {style: "thin"},
        left: {style: "thin"},
        right: {style: "thin"},
        bottom: {style: "thin"}

      }
      worksheet4Years.getCell(`${contador3 + 3}`, `${contador2 + 3}`).value = totalgenerom;
      worksheet4Years.getCell(`${contador3 + 3}`, `${contador2 + 4}`).value = totalgenerof;
      worksheet4Years.getCell(`${contador3 + 3}`,`${contador2 + 3}`).border = {
        top: {style: "thin"},
        left: {style: "thin"},
        right: {style: "thin"},
        bottom: {style: "thin"}
      }
      worksheet4Years.getCell(`${contador3 + 3}`,`${contador2 + 4}`).border = {
        top: {style: "thin"},
        left: {style: "thin"},
        right: {style: "thin"},
        bottom: {style: "thin"}
      }
      // worksheet4Years.getCell(`${contador3 + 3}`, `${contador2 + -2}`).merge(worksheet4Years.getCell(`${contador3 + 3}`, `${contador2 + 2}`))
      // worksheet4Years.mergeCells(contador3 + 3, contador2 - 4, contador3 + 3, contador2 + 2);
      worksheet4Years.getCell(`${contador3 + 3}`, `${contador2 + 2}`).value = "Total asistencia mensual por genero";
      worksheet4Years.getCell(`${contador3 + 3}`, `${contador2 + 2}`).alignment = {vertical: "bottom", horizontal: "right"}
      worksheet4Years.getCell(`${contador3 + 3}`,`${contador2 + 2}`).border = {
        top: {style: "thin"},
        left: {style: "thin"},
        right: {style: "thin"},
        bottom: {style: "thin"}
        
      }
      contador3 += 2;
      
      worksheet4Years.mergeCells("A" + (contador3 + 3) + ":A" + (contador3 + 7));
      worksheet4Years.getCell(`A${contador3 + 3}`).font = {bold: true}
      worksheet4Years.getCell(`A${contador3 + 3}`).alignment = {textRotation: "vertical", wrapText: true}
      worksheet4Years.getCell(`A${contador3 + 3}`).border = {
        top: {style: "thin"},
        left: {style: "thin"},
        right: {style: "thin"},
        bottom: {style: "thin"}
      }
      worksheet4Years.getCell(`B${contador3 + 3}`).border = {
        top: {style: "thin"},
        left: {style: "thin"},
        right: {style: "thin"},
        bottom: {style: "thin"}
      }
      worksheet4Years.getCell(`B${contador3 + 4}`).border = {
        top: {style: "thin"},
        left: {style: "thin"},
        right: {style: "thin"},
        bottom: {style: "thin"}
      }
      worksheet4Years.getCell(`B${contador3 + 5}`).border = {
        top: {style: "thin"},
        left: {style: "thin"},
        right: {style: "thin"},
        bottom: {style: "thin"}
      }
      worksheet4Years.getCell(`B${contador3 + 6}`).border = {
        top: {style: "thin"},
        left: {style: "thin"},
        right: {style: "thin"},
        bottom: {style: "thin"}
      }
      worksheet4Years.getCell(`A${contador3 + 3}`).value = "RESUMEN DIARIO";
      worksheet4Years.getCell(`B${contador3 + 3}`).value = "PRESENTES";
      worksheet4Years.getCell(`B${contador3 + 4}`).value = "INASISTENTES CON PERMISO";
      worksheet4Years.getCell(`B${contador3 + 5}`).value = "INASISTENTES SIN PERMISO";
      worksheet4Years.getCell(`B${contador3 + 6}`).value = "MATRICULA EFECTIVA";



      totaldiaasistencia.forEach((total1, index) => {
        if (total1 == 0) {
          worksheet4Years.getCell(`${contador3 + 3}`,`${index + 3}`).value = ""; 
        } else {
          worksheet4Years.getCell(`${contador3 + 3}`,`${index + 3}`).value = total1;
        }
        worksheet4Years.getCell(`${contador3 + 3}`, `${index + 3}`).border = {
          top: {style: "thin"},
          left: {style: "thin"},
          right: {style: "thin"},
          bottom: {style: "thin"}
        }
      });

      worksheet4Years.getCell(`${contador3 + 3}`,`${contador2 + 4}`).value = totalasistencia2;
      worksheet4Years.getCell(`${contador3 + 4}`,`${contador2 + 4}`).value = totalpermiso;
      worksheet4Years.getCell(`${contador3 + 5}`,`${contador2 + 4}`).value = totalsinpermiso;
      worksheet4Years.getCell(`${contador3 + 6}`,`${contador2 + 4}`).value = totaldias2;
      
      contador3++;
      totaldiapermiso.forEach((total1, index) => {
        if (total1 == 0) {
          worksheet4Years.getCell(`${contador3 + 3}`,`${index + 3}`).value = "";
        } else {
          worksheet4Years.getCell(`${contador3 + 3}`,`${index + 3}`).value = total1;
        }
        worksheet4Years.getCell(`${contador3 + 3}`, `${index + 3}`).border = {
          top: {style: "thin"},
          left: {style: "thin"},
          right: {style: "thin"},
          bottom: {style: "thin"}
        }
      });
      contador3++;
      totaldiasinpermiso.forEach((total1, index) => {
        if (total1 == 0) {
          worksheet4Years.getCell(`${contador3 + 3}`,`${index + 3}`).value = "";  
        } else {
          worksheet4Years.getCell(`${contador3 + 3}`,`${index + 3}`).value = total1;
        }
        worksheet4Years.getCell(`${contador3 + 3}`, `${index + 3}`).border = {
          top: {style: "thin"},
          left: {style: "thin"},
          right: {style: "thin"},
          bottom: {style: "thin"}
        }
      });
      contador3++;
      totalmatricula1.forEach((total1, index) => {
        if (total1 == 0) {
          worksheet4Years.getCell(`${contador3 + 3}`,`${index + 3}`).value = "";
        } else {
          worksheet4Years.getCell(`${contador3 + 3}`,`${index + 3}`).value = total1;
        }
        worksheet4Years.getCell(`${contador3 + 3}`, `${index + 3}`).border = {
          top: {style: "thin"},
          left: {style: "thin"},
          right: {style: "thin"},
          bottom: {style: "thin"}
        }
      });

      worksheet4Years.getCell(`${contador3 + 4}`,`2`).value = "ASISTENCIA MENSUAL MEDIA M " + mediaAsistenciaM + " F " + mediaAsistenciaF; 
      worksheet4Years.getCell(`${contador3 + 4}`, `2`).border = {
        top: {style: "thin"},
        left: {style: "thin"},
        right: {style: "thin"},
        bottom: {style: "thin"}
      } 
      let totalmatricula = totalmatricula1.length;
      let tamano1 = Math.round(totalmatricula * 0.25);
      let tamano2 = Math.round(totalmatricula1 * 0.72);
      worksheet4Years.mergeCells(`${contador3 + 4}`,`2`, contador3 + 4, 4); 
      contador3++;
      worksheet4Years.getCell(`${contador3 + 4}`,`${ 2}`).value = "INASISTENCIA MENSUAL MEDIA M " + inasistenciam + " F " + inasistenciaf; 
      worksheet4Years.getCell(`${contador3 + 4}`, `${2}`).border = {
        top: {style: "thin"},
        left: {style: "thin"},
        right: {style: "thin"},
        bottom: {style: "thin"}
      } 
      // worksheet4Years.mergeCells(`${contador3 + 4}`, contador2 + 4 - tamano2, contador3 + 4, `${contador2 + 4}`);  
      
      let contador4 = 3;
      worksheet4Years.getCell(`${contador3 + 6}`,`${3}`).value = "INDICADOR";  
      worksheet4Years.getCell(`${contador3 + 6}`,`${6}`).merge(worksheet4Years.getCell(`${contador3 + 6}`,`${3}`));
      worksheet4Years.getCell(`${contador3 + 6}`, `${3}`).border = {
        top: {style: "thin"},
        left: {style: "thin"},
        right: {style: "thin"},
        bottom: {style: "thin"}
      }

      worksheet4Years.getCell(`${contador3 + 6}`,`${contador4 + 4}`).value = "M";
      worksheet4Years.getCell(`${contador3 + 6}`, `${contador4 + 4}`).border = {
        top: {style: "thin"},
        left: {style: "thin"},
        right: {style: "thin"},
        bottom: {style: "thin"}
      }
      worksheet4Years.getCell(`${contador3 + 6}`,`${contador4 + 5}`).value = "F";
      worksheet4Years.getCell(`${contador3 + 6}`, `${contador4 + 5}`).border = {
        top: {style: "thin"},
        left: {style: "thin"},
        right: {style: "thin"},
        bottom: {style: "thin"}
      }
      worksheet4Years.getCell(`${contador3 + 6}`,`${contador4 + 6}`).value = "T";  
      worksheet4Years.getCell(`${contador3 + 6}`, `${contador4 + 6}`).border = {
        top: {style: "thin"},
        left: {style: "thin"},
        right: {style: "thin"},
        bottom: {style: "thin"}
      }
      worksheet4Years.getCell(`${contador3 + 7}`,`${3}`).value = "ASISTENCIA";  
      worksheet4Years.getCell(`${contador3 + 7}`, `${3}`).border = {
        top: {style: "thin"},
        left: {style: "thin"},
        right: {style: "thin"},
        bottom: {style: "thin"}
      }
      worksheet4Years.getCell(`${contador3 + 7}`,`${6}`).merge(worksheet4Years.getCell(`${contador3 + 7}`,`${3}`));
      worksheet4Years.getCell(`${contador3 + 7}`,`${contador4 + 4}`).value = mediaAsistenciaM;
      worksheet4Years.getCell(`${contador3 + 7}`, `${contador4 + 4}`).border = {
        top: {style: "thin"},
        left: {style: "thin"},
        right: {style: "thin"},
        bottom: {style: "thin"}
      }
      worksheet4Years.getCell(`${contador3 + 7}`,`${contador4 + 5}`).value = mediaAsistenciaF;
      worksheet4Years.getCell(`${contador3 + 7}`, `${contador4 + 5}`).border = {
        top: {style: "thin"},
        left: {style: "thin"},
        right: {style: "thin"},
        bottom: {style: "thin"}
      }
      worksheet4Years.getCell(`${contador3 + 7}`,`${contador4 + 6}`).value = mediaAsistenciaM + mediaAsistenciaF;  
      worksheet4Years.getCell(`${contador3 + 7}`, `${contador4 + 6}`).border = {
        top: {style: "thin"},
        left: {style: "thin"},
        right: {style: "thin"},
        bottom: {style: "thin"}
      }
      worksheet4Years.getCell(`${contador3 + 8}`,`${3}`).value = "INASISTENCIA";
      worksheet4Years.getCell(`${contador3 + 8}`,`${6}`).merge(worksheet4Years.getCell(`${contador3 + 8}`,`${3}`));
      worksheet4Years.getCell(`${contador3 + 8}`, `${3}`).border = {
        top: {style: "thin"},
        left: {style: "thin"},
        right: {style: "thin"},
        bottom: {style: "thin"}
      }
      worksheet4Years.getCell(`${contador3 + 8}`,`${contador4 + 4}`).value = inasistenciam;
      worksheet4Years.getCell(`${contador3 + 8}`, `${contador4 + 4}`).border = {
        top: {style: "thin"},
        left: {style: "thin"},
        right: {style: "thin"},
        bottom: {style: "thin"}
      }
      worksheet4Years.getCell(`${contador3 + 8}`,`${contador4 + 5}`).value = inasistenciaf;
      worksheet4Years.getCell(`${contador3 + 8}`, `${contador4 + 5}`).border = {
        top: {style: "thin"},
        left: {style: "thin"},
        right: {style: "thin"},
        bottom: {style: "thin"}
      }
      worksheet4Years.getCell(`${contador3 + 8}`,`${contador4 + 6}`).value = inasistenciam + inasistenciaf;  
      worksheet4Years.getCell(`${contador3 + 8}`, `${contador4 + 6}`).border = {
        top: {style: "thin"},
        left: {style: "thin"},
        right: {style: "thin"},
        bottom: {style: "thin"}
      }
      worksheet4Years.getCell(`${contador3 + 9}`,`${3}`).value = "EGRESADOS";    
      worksheet4Years.getCell(`${contador3 + 9}`, `${3}`).border = {
        top: {style: "thin"},
        left: {style: "thin"},
        right: {style: "thin"},
        bottom: {style: "thin"}
      }
      worksheet4Years.getCell(`${contador3 + 9}`,`${6}`).merge(worksheet4Years.getCell(`${contador3 + 9}`,`${3}`));
      worksheet4Years.getCell(`${contador3 + 9}`, `${6}`).border = {
        top: {style: "thin"},
        left: {style: "thin"},
        right: {style: "thin"},
        bottom: {style: "thin"}
      }
      worksheet4Years.getCell(`${contador3 + 10}`,`${3}`).value = "INGRESOS";  
      worksheet4Years.getCell(`${contador3 + 10}`, `${3}`).border = {
        top: {style: "thin"},
        left: {style: "thin"},
        right: {style: "thin"},
        bottom: {style: "thin"}
      }
      worksheet4Years.getCell(`${contador3 + 10}`,`${6}`).merge(worksheet4Years.getCell(`${contador3 + 10}`,`${3}`));
      
      
      

    //     switch(row.asistencia){
    //       case ".": estado="."; break;
    //       case "p": estado="P"; break;
    //       default: estado="SP";
    //     }
        
    //     worksheet4Years.getCell(`${index +2}`, colNumber).value=estado;
    //    });
    
    
  }
  
  await exportarexcel(4);
  await exportarexcel(5);
  await exportarexcel(6);
  await workbook.xlsx.writeFile(`asistencia ${mes}.xlsx`);
       // await crearExcel(arregloAlumnos4anios, "4 años");
       // await crearExcel(arregloAlumnos5anios, "5 años");
       // await crearExcel(arregloAlumnos6anios, "6 años");
       
      //  res.send({
      //    ok: true,
      //    directorios: "estudiantes"
      //   });

      res.download(`asistencia ${mes}.xlsx`)
      // workbook.xlsx.writeBuffer().then((buffer) => {
      //   // Enviar el archivo como respuesta
      //   res.attachment(`asistencia${mes}.xlsx`);
      //   res.send(buffer);
      // });
      });

app.get("/descargar/:nombre", (req, res) => {
    let nombre = req.params.nombre;
    res.download("./files/"+nombre+".xlsx");
})

app.post("/actualizarAsistencia", async (req, res) => {
    

    console.log(req.body);
    let alumno = req.body.id;
    let alumnos = req.body;

    await alumnos.forEach(async estudiante => {
        let asistencia = "";
        if (estudiante.asistio) {
            asistencia = ".";
        } else if (estudiante.permiso) {
            asistencia = "P";
        } else {
            asistencia = "SP";
        }
        await query("update asistencia set asistencia = ? where id = ?", [asistencia, estudiante.id]);
    })
    res.send("");
});

app.listen(port, () => {
    console.log("Servidor ejecutandose");
});

