import flows from './flows'
import calls from './calls'
import tenants from './tenants'

const v2 = {
    flows: Object.assign(flows, flows),
    calls: Object.assign(calls, calls),
    tenants: Object.assign(tenants, tenants),
}

export default v2