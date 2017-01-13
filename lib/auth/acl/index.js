// External modules
var Boom	= require('boom');
var Hoek	= require('hoek');
var Q			= require('q');

// Internal modules
var Roles					= require('./roles');
var Schema				= require('./schema');
var RoleHierarchy	= Roles.hierarchy;
var ACL						= require('./acl');

var pluginName = 'hapiAuthorization';
var internals = {
	defaults: {
		roles: Roles.roles,
		hierarchy: false,
		roleHierarchy: RoleHierarchy
	}
};

/**
 * Registers the plugin
 *
 * @param plugin
 * @param options
 * @param next
 */
exports.register = function (server, options, next) {

	try {
		// Validate the options passed into the plugin
		Schema.assert('plugin', options, 'Invalid settings');

		var settings = Hoek.applyToDefaults(internals.defaults, options || {});

		server.bind({
			config: settings
		});

		// Validate the server options on the routes
		if (server.after) { // Support for hapi < 11
			server.after(internals.validateRoutes);
		} else {
			server.ext('onPreStart', internals.validateRoutes);
		}
		server.ext('onPreHandler', internals.onPreHandler);

		next();
	} catch (e) {

		next(e);
	}
};

/**
 * Gets the name and version from package.json
 */
exports.register.attributes = {
	pkg: require('../package.json')
};


/**
 * Runs on server start and validates that every route that has hapi-authorization params is valid
 *
 * @param server
 * @param next
 */
internals.validateRoutes = function(server, next) {

	try {
		// Loop through each connection in the server
		server.connections.forEach(function(connection) {

			var routes = (connection.routingTable) ? connection.routingTable() : connection.table();

			// Loop through each route
			routes.forEach(function(route) {

				var hapiAuthorizationParams = route.settings.plugins[pluginName] ? route.settings.plugins[pluginName] : false;

				// If there are hapi-authorization params and are not disabled by using "false", validate em
				if (hapiAuthorizationParams !== false) {

					// If there is a default auth
					if(connection.auth.settings.default) {

						// If there is also an auth on the route, make sure it's not false or null
						if(route.settings.auth !== undefined) {

							// Make sure that there is either a default auth being set, or that there is an auth specified on every route with hapiAuthorization plugin params
							Hoek.assert(route.settings.auth !== null && route.settings.auth !== false, 'hapi-authorization can be enabled only for secured route');
						}
					}
					// Else there is no default auth set, so validate each route's auth
					else {
						// Make sure that there is either a default auth being set, or that there is an auth specified on every route with hapiAuthorization plugin params
						Hoek.assert(route.settings.auth && route.settings.auth !== null && route.settings.auth !== false, 'hapi-authorization can be enabled only for secured route');
					}

					Schema.assert('route', hapiAuthorizationParams, 'Invalid settings');
				}
			});
		});
		next();
	}
	catch (err) {
		next(err);
	}
};

/**
 * Checks if hapi-authorization is active for the current route and execute the necessary steps accordingly.
 *
 * @param request
 * @param reply
 */
internals.onPreHandler = function(request, reply) {

		// Ignore OPTIONS requests
		if(request.route.method === 'options') {
			return reply.continue();
		}

		var params;
		try{
			// Check if the current route is hapi-authorization enabled
			params = internals.getRouteParams(request);
		}
		catch(err){
			return reply(Boom.badRequest(err.message));
		}

		// if hapi-authorization is enabled, get the user
		if (params) {

			var user = request.auth.credentials;

			if (!request.plugins[pluginName]) {
				request.plugins[pluginName] = {};
			}

			var roleHierarchy = null;

			// If we're not using hierarchy
			if(this.config.hierarchy === true) {
				// this.config comes from plugin.bind
				roleHierarchy = this.config.roleHierarchy;
			} else {
				roleHierarchy = false;
			}

			Q
				// Checks roles
				.fcall(function () {
					if (params.role || params.roles) {
						var err = ACL.checkRoles(user, params.role || params.roles, roleHierarchy);
						if (err) {
							throw err;
						}
					}
					return true;
				})
				// Fetches acl entities
				.then(function () {
					if (params.aclQuery) {
						var parameter = request[params.paramSource][params.aclQueryParam];
						return ACL.fetchEntity(params.aclQuery, parameter, request);
					}
					return null;
				})
				// Store the entity
				.then(function(entity) {
					if (entity) {
						request.plugins[pluginName].entity = entity;
						return entity;
					}
				})
				// Validate the ACL settings
				.then(function(entity) {
					if (params.validateEntityAcl) {
						if (!entity) {
							throw new Error('Entity is required');
						}

						return ACL.validateEntityAcl(user, params.role, entity, params.validateAclMethod, params);
					}
					return null;
				})
				.then(function () {
					reply.continue();
				})
				// Handles errors
				.catch(function (err) {
					reply(err);
				});

		} else {
			reply.continue();
		}
};

/**
 * Returns the plugin params for the current request
 *
 * @param request
 * @returns {*}
 */
internals.getRouteParams = function(request) {

	if (request.route.settings.plugins[pluginName]) {
		var params = request.route.settings.plugins[pluginName];
		return Schema.assert('route', params, 'Invalid settings');
	} else {
		return null;
	}
};
