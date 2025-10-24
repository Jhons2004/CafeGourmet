// Observer para notificar cuando el stock es bajo
class ComprasObserver {
    update(granosBajos) {
        console.log('Notificación: El stock de los siguientes granos es bajo:', granosBajos);
    }
}

module.exports = ComprasObserver;
