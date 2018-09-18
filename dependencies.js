/**
 * This is dependencies registration.
 * All internal Functions, Models, or Modules are registered here as a path identification.
 *
 * @return   JSON
 */
module.exports = {

    /**
     * @return   mixed
     */
    routes: () => {
        return require('./http/routes');
    },

    /**
     * @param    string   path
     * @return   mixed
     */
    controllers: (path) => {
        return require('./controllers/' + path);
    },

    /**
     * @param    string   path
     * @return   mixed
     */
    models: (path) => {
        return require('./models/' + path);
    },

    /**
     * @param    string   path
     * @return   mixed
     */
    modules: (path) => {
        return require('./modules/' + path);
    }
};