/**
 * GestorDeInventario.js
 * Patrón Singleton para control central de inventario
 * Asegura una única instancia del gestor en toda la aplicación
 * 
 * @pattern Singleton
 * @author Sistema Café Gourmet
 * @version 2.0.0
 * @date 2025-10-25
 */

class GestorDeInventario {
    constructor() {
        // Implementación Singleton: retornar instancia existente
        if (GestorDeInventario.instance) {
            return GestorDeInventario.instance;
        }
        
        // Inicializar propiedades
        this.inventario = [];
        this.productosTerminados = [];
        this.proveedores = [];
        
        // Guardar instancia única
        GestorDeInventario.instance = this;
    }

    // ==================== GRANOS ====================
    
    /**
     * Agregar un nuevo grano al inventario
     * @param {Object} grano - Datos del grano (tipo, cantidad, proveedor)
     */
    agregarGrano(grano) {
        this.inventario.push(grano);
        console.log(`✅ Grano agregado: ${grano.tipo} (${grano.cantidad} kg)`);
    }

    /**
     * Actualizar stock de un grano existente
     * @param {String} id - ID del grano
     * @param {Number} cantidad - Nueva cantidad
     */
    actualizarStock(id, cantidad) {
        const grano = this.inventario.find(g => g.id === id);
        if (grano) {
            const anterior = grano.cantidad;
            grano.cantidad = cantidad;
            console.log(`📊 Stock actualizado: ${grano.tipo} ${anterior} → ${cantidad} kg`);
        }
    }

    /**
     * Obtener inventario completo de granos
     * @returns {Array} Lista de granos
     */
    obtenerInventario() {
        return this.inventario;
    }

    /**
     * Buscar granos por tipo (arabica, robusta, blend)
     * @param {String} tipo - Tipo de grano
     * @returns {Array} Granos del tipo especificado
     */
    buscarPorTipo(tipo) {
        return this.inventario.filter(g => g.tipo === tipo);
    }

    /**
     * Obtener granos con stock bajo el umbral
     * @param {Number} threshold - Umbral de stock bajo (default: 10)
     * @returns {Array} Granos con stock bajo
     */
    stockBajo(threshold = 10) {
        const granosBajos = this.inventario.filter(g => g.cantidad <= threshold);
        if (granosBajos.length > 0) {
            console.warn(`⚠️ ${granosBajos.length} granos con stock bajo (<=${threshold} kg)`);
        }
        return granosBajos;
    }

    // ==================== PRODUCTOS TERMINADOS ====================
    
    /**
     * Agregar producto terminado al inventario
     * @param {Object} producto - Producto terminado
     */
    agregarProducto(producto) {
        this.productosTerminados.push(producto);
        console.log(`✅ Producto agregado: ${producto.nombre}`);
    }

    /**
     * Actualizar stock de producto terminado
     * @param {String} id - ID del producto
     * @param {Number} cantidad - Nueva cantidad
     */
    actualizarProducto(id, cantidad) {
        const producto = this.productosTerminados.find(p => p.id === id);
        if (producto) {
            producto.cantidad = cantidad;
            console.log(`📦 Producto actualizado: ${producto.nombre} → ${cantidad} unidades`);
        }
    }

    /**
     * Obtener todos los productos terminados
     * @returns {Array} Lista de productos terminados
     */
    obtenerProductosTerminados() {
        return this.productosTerminados;
    }

    // ==================== PROVEEDORES ====================
    
    /**
     * Agregar proveedor al sistema
     * @param {Object} proveedor - Datos del proveedor
     */
    agregarProveedor(proveedor) {
        this.proveedores.push(proveedor);
        console.log(`✅ Proveedor agregado: ${proveedor.nombre}`);
    }

    /**
     * Obtener lista de proveedores
     * @returns {Array} Lista de proveedores
     */
    obtenerProveedores() {
        return this.proveedores;
    }

    // ==================== ESTADÍSTICAS ====================
    
    /**
     * Obtener resumen del inventario
     * @returns {Object} Estadísticas del inventario
     */
    obtenerResumen() {
        const totalGranos = this.inventario.reduce((sum, g) => sum + g.cantidad, 0);
        const totalProductos = this.productosTerminados.reduce((sum, p) => sum + p.cantidad, 0);
        
        return {
            granos: {
                tipos: this.inventario.length,
                cantidadTotal: totalGranos,
                stockBajo: this.stockBajo().length
            },
            productosTerminados: {
                tipos: this.productosTerminados.length,
                cantidadTotal: totalProductos
            },
            proveedores: this.proveedores.length
        };
    }

    /**
     * Obtener instancia única del gestor (Singleton)
     * @returns {GestorDeInventario} Instancia única
     */
    static getInstance() {
        if (!GestorDeInventario.instance) {
            GestorDeInventario.instance = new GestorDeInventario();
        }
        return GestorDeInventario.instance;
    }

    /**
     * Reset de la instancia (útil para testing)
     */
    static resetInstance() {
        GestorDeInventario.instance = null;
        console.log('🔄 Instancia de GestorDeInventario reseteada');
    }
}

// Exportar instancia única
module.exports = new GestorDeInventario();
