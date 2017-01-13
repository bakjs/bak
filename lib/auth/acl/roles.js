/**
 * The default roles and role hierarchy if a custom one isn't passed in
 */

// The default roles
//var RoleTypes = {
//  SUPER_ADMIN: 'SUPER_ADMIN',
//  ADMIN: 'ADMIN',
//  USER: 'USER',
//  GUEST: 'GUEST'
//};

var SUPER_ADMIN	= 'SUPER_ADMIN';
var ADMIN				= 'ADMIN';
var USER				= 'USER';
var GUEST				= 'GUEST';

// The default roles and hierarchy
var RoleTypes = [SUPER_ADMIN, ADMIN, USER, GUEST];
var RoleHierarchy = RoleTypes;	// Is the same because of the order we defined them

// The default role hierarchy
//var RoleHierarchy = [];
//RoleHierarchy.SUPER_ADMIN	= [SUPER_ADMIN, ADMIN, USER, GUEST];
//RoleHierarchy.ADMIN				= [ADMIN, USER, GUEST];
//RoleHierarchy.USER				= [USER, GUEST];
//RoleHierarchy.GUEST				= [GUEST];

module.exports = {
  roles: RoleTypes,
  hierarchy: RoleHierarchy
};