document.addEventListener('DOMContentLoaded', async function () {
  const selectDocumento = document.getElementById('pase-documento');
  const selectDeptoDestino = document.getElementById('pase-depto-destino');
  const selectReceptor = document.getElementById('pase-receptor');
  const selectDeptoActual = document.getElementById('pase-depto-actual');
  let departamentos = [];
  let empleados = [];

  async function fetchData(url, headers = {}) {
    try {
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error(`Error en ${url}: ${await res.text()}`);
      const data = await res.json();
      if (!data || !Array.isArray(data) || data.length === 0) {
        throw new Error(`La respuesta de ${url} está vacía o no tiene formato correcto.`);
      }
      return data;
    } catch (err) {
      alert(`Error al cargar datos: ${err.message}`);
      return [];
    }
  }

  async function cargarDepartamentos() {
    departamentos = await fetchData('http://localhost:5001/departamento/getdepartamentos');
    if (!selectDeptoDestino || !selectDeptoActual) return;
    selectDeptoDestino.innerHTML = '<option value="">Seleccione un departamento</option>';
    departamentos.forEach(depto => {
      const option = document.createElement('option');
      option.value = depto.id_dpto;
      option.textContent = depto.nombre;
      selectDeptoDestino.appendChild(option);
    });
  }

  async function cargarEmpleados() {
    empleados = await fetchData('http://localhost:5001/empleado/getempleados', {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });
    if (!selectReceptor) return;
    selectReceptor.innerHTML = '<option value="">Seleccione un empleado</option>';
    empleados.forEach(emp => {
      if (!emp.departamento || !emp.departamento.id_dpto) {
        console.warn(`El empleado ${emp.nombre_completo} no tiene un departamento asignado correctamente.`);
      }
      const option = document.createElement('option');
      option.value = emp.id_empleado;
      option.textContent = emp.nombre_completo;
      selectReceptor.appendChild(option);
    });
  }

  async function cargarDocumentos() {
    const documentos = await fetchData('http://localhost:5001/documento/getdocumentos', {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });
    if (!selectDocumento) return;
    selectDocumento.innerHTML = '<option value="">Seleccione un documento</option>';
    documentos.forEach(doc => {
      const option = document.createElement('option');
      option.value = doc.id_doc;
      option.textContent = doc.NumeroDoc;
      selectDocumento.appendChild(option);
    });
  }

  function obtenerDepartamentoActual() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.departamento || !selectDeptoActual) return;
    selectDeptoActual.innerHTML = '';
    const option = document.createElement('option');
    option.value = user.departamento.id_dpto;
    option.textContent = user.departamento.nombre;
    option.selected = true;
    selectDeptoActual.appendChild(option);
  }

  async function crearPase(event) {
    event.preventDefault();
    const id_departamento_actual = JSON.parse(localStorage.getItem('user'))?.departamento?.id_dpto;
    const departamentoDestinoId = selectDeptoDestino.value;
    const receptorId = selectReceptor.value;

    if (!id_departamento_actual) return alert('Error: No se pudo obtener el departamento actual.');
    if (!departamentoDestinoId) return alert('Seleccione un departamento destino.');
    if (!receptorId) return alert('Seleccione un empleado receptor.');

    const paseData = {
      id_doc: selectDocumento.value,
      id_departamento_actual,
      id_departamento_destino: departamentoDestinoId,
      id_receptor: receptorId,
      objetivo: document.getElementById('pase-objetivo').value.trim(),
      descripcion: document.getElementById('pase-descripcion').value.trim()
    };

    const departamentoDestino = departamentos.find(depto => parseInt(depto.id_dpto) === parseInt(departamentoDestinoId));
    const receptor = empleados.find(emp => parseInt(emp.id_empleado) === parseInt(receptorId));

    if (!departamentoDestino) return alert('Error: El departamento destino no es válido.');
    if (!receptor) return alert('Error: El receptor seleccionado no es válido.');
    try {
      const res = await fetch('http://localhost:5001/pase/createPase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(paseData)
      });
      if (!res.ok) throw new Error(await res.text());
      mostrarModalExito('Pase creado exitosamente');
      document.getElementById('form-pase').reset();
    } catch (err) {
      mostrarModalExito(`Error al crear el pase: ${err.message}`, true);
    }
  }

  function mostrarModalExito(mensaje, esError = false) {
    let modal = document.getElementById('modal-exito');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modal-exito';
      modal.style.cssText = `
        position: fixed; top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        background: #fff; padding: 24px;
        border-radius: 10px; box-shadow: 0 4px 24px rgba(0,0,0,0.18);
        z-index: 9999; text-align: center; min-width: 260px;
        font-size: 1.2rem;
      `;
      document.body.appendChild(modal);
    }
    modal.innerHTML = `<span style="font-size:2rem;">${esError ? '❌' : '✅'}</span><br>${mensaje}`;
    modal.style.color = esError ? '#e57373' : '#0d3c61';
    modal.style.display = 'block';
    setTimeout(() => { modal.style.display = 'none'; }, 2000);
  }

  obtenerDepartamentoActual();
  await cargarDepartamentos();
  await cargarEmpleados();
  await cargarDocumentos();
  document.getElementById('form-pase').addEventListener('submit', crearPase);
});
