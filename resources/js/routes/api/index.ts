import v1 from './v1'
import v2 from './v2'
import tenant from './tenant'

const api = {
    v1: Object.assign(v1, v1),
    v2: Object.assign(v2, v2),
    tenant: Object.assign(tenant, tenant),
}

export default api