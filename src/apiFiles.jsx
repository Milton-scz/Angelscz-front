import { toast } from 'react-toastify';

const uploadFiles = async (pictures, profileId, onProgressUpdate) => {
    // Verificar si hay archivos
    if (!pictures || pictures.length === 0) {
        toast.warning('No hay archivos para subir'); // Notificación si no hay archivos
        return; // Salir de la función
    }

    const formData = new FormData();

    // Convertir imágenes a formato adecuado
    pictures.forEach(picture => {
        const byteString = atob(picture.src.split(',')[1]);
        const mimeString = picture.src.split(',')[0].split(':')[1].split(';')[0];
        const ab = new Uint8Array(byteString.length);
        for (let i = 0; i < byteString.length; i++) {
            ab[i] = byteString.charCodeAt(i);
        }
        const file = new Blob([ab], { type: mimeString });
        formData.append('files', file, picture.name);
    });

    // Agregar el profile_id
    formData.append('profile_id', profileId);

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // Manejar la barra de progreso
        xhr.upload.addEventListener("progress", function (evt) {
            if (evt.lengthComputable) {
                const percentComplete = (evt.loaded / evt.total) * 100;
                onProgressUpdate(percentComplete); // Actualizar la barra de progreso
            }
        }, false);

        // Manejar la respuesta
        xhr.onreadystatechange = () => {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    toast.success('Archivos subidos exitosamente');
                    resolve(JSON.parse(xhr.responseText));
                } else {
                    const errorText = xhr.responseText || 'Error al subir los archivos';
                    toast.error(errorText);
                    reject(new Error(errorText));
                }
            }
        };

        // Manejar errores
        xhr.onerror = () => {
            toast.error('Error en la conexión al subir archivos');
            reject(new Error('Error en la conexión al subir archivos'));
        };

        xhr.open('POST', 'https://file.angelmemoriesbo.me/api/files/upload');
        xhr.send(formData);
    });
};

const deleteFiles = (gallery_id, filePath) => {
    const formData = new FormData();
    formData.append('gallery_id', gallery_id);
    formData.append('filePath', filePath);

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // Manejar la respuesta
        xhr.onreadystatechange = () => {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    toast.success('Archivo eliminado exitosamente');
                    resolve(xhr.responseText);
                } else {
                    const errorText = xhr.responseText || 'Error al eliminar el archivo';
                    toast.error(errorText);
                    reject(new Error(errorText));
                }
            }
        };

        // Manejar errores
        xhr.onerror = () => {
            toast.error('Error en la conexión al eliminar el archivo');
            reject(new Error('Error en la conexión al eliminar el archivo'));
        };

        // Configurar la solicitud XHR para eliminar
        xhr.open('DELETE', 'https://file.angelmemoriesbo.me/api/files/deleteFile');
        xhr.send(formData); // Enviar los datos en el cuerpo de la solicitud
    });
};


export { uploadFiles, deleteFiles };
