import axios from 'axios'
import Common from '../../Common'

const API = axios.create({
	baseURL: `${Common.BACKEND_URL}/api`,
        headers: {'authorization': `Bearer ${Common.MASTER_KEY}`}
})

export default API
