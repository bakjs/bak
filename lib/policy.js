/**
 * @link https://github.com/franciscogouveia/hapi-rbac/blob/master/API.md
 * @author Pooya Parsa <pooya@pi0.ir>
 */

/**
 * Deny effect
 * @type {string}
 */
const DENY = 'deny';

/**
 * Permit effect
 * @type {string}
 */
const PERMIT = 'permit';

/**
 * If at least one policy/rule permits, then the final decision for that policy set/policy should be PERMIT
 * (deny, unless one permits)
 * @type {string}
 */
const DENY_DEFAULT = 'permit-overrides';

/**
 * If at least one policy/rule denies, then the final decision for that policy set/policy should be DENY
 * (permit, unless one denies)
 * @type {string}
 */
const PERMIT_DEFAULT = 'deny-overrides';

/**
 * A Policy is a set of rules
 */
class Policy {

    /**
     *
     * @param {string} [apply=PERMIT_DEFAULT] - The combinatory algorithm for the rules
     * @param {Rule[]} [rules=[]] - An array of rules
     * @param {Object} [target] - The target (default: matches with any)
     */
    constructor(apply, rules, target) {
        if (target) this.target = target;
        this.apply = apply || PERMIT_DEFAULT;
        this.rules = rules || [];
    }

    /**
     *
     * @param {Rule} r
     */
    add(r) {
        if (!r instanceof Rule) throw Error("rule not instance of Rule!");
        this.rules.push(r);
    }
}

/**
 * A Rule defines a decision to allow or deny access
 */
class Rule {

    /**
     * @param {string} [effect=DENY] - The decision if the target matches. Can be PERMIT or DENY
     * @param {Object} [target] - The target (default: matches with any)
     */
    constructor(effect, target) {
        if (target) this.target = target;
        this.effect = effect || DENY;
    }
}

/**
 * A Policy Set is a set of Policies
 */
class PolicySet {

    /**
     *
     * @param {string} [apply=PERMIT_DEFAULT] - The combinatory algorithm for the policies
     * @param {Policy[]} [policies=[]] - {Policy[]} An array of policies
     * @param {Object} [target] - target The target (default: matches with any)
     */
    constructor(apply, policies, target) {
        if (target) this.target = target;
        this.apply = apply || PERMIT_DEFAULT;
        this.policies = policies || [];
    }

    /**
     *
     * @param {Policy} p
     */
    add(p) {
        if (!p instanceof Policy) throw Error("policy not instance if Policy!");
        this.policies.push(p);
    }
}

/**
 * @returns {Rule}
 */
function ban_rule() {
    return new Rule(DENY, {'credentials:is_banned': true})
}

/**
 * @returns {PolicySet}
 */
function defaults() {
    let policies = new PolicySet();
    let internal = new Policy();

    // Check for deniers
    internal.add(ban_rule());

    policies.add(internal);
    return policies;
}

/**
 * @param {Object} target
 * @returns {PolicySet}
 */
function authorize(target) {
    let policies = defaults();

    let policy = new Policy(DENY_DEFAULT); // Deny, unless authorized
    policy.add(new Rule(PERMIT, target)); //  The authorize rule
    policies.add(policy);

    return policies;
}

module.exports = {
    DENY, PERMIT, PERMIT_DEFAULT, DENY_DEFAULT,
    Policy, Rule, PolicySet,
    authorize, defaults
};
