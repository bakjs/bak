module.exports = class Policy {

    constructor(policies) {
        this.rules = {};
        if (policies) {
            this._import_policies(policies);
        }
    }

    /**
     *
     * @param name
     * @param fn
     */
    define(name, fn) {
        if (this.rules[name])
            throw new Error("Rule " + name + " already defined!");
        this.rules[name] = fn;
    }

    /**
     *
     * @param user
     * @param action
     * @param target
     * @returns {Boolean|null}
     */
    can(user, action, target) {
        if (!user || !action) return false;
        if (!this.rules[action]) return null;
        return this.rules[action](user, target);
    }

    /**
     *
     * @param policies
     */
    _import_policies(policies) {
        Object.keys(policies).forEach((policy) => {
            this.define(policy, policies[policy])
        });
    }
};