import axios from 'axios';

const HIRING_ZOHO_API = import.meta.env.VITE_HIRING_ZOHO_URL;

class DocumentService {
  async downloadDocument(fileName: string) {
    const { data } = await axios.post(`${HIRING_ZOHO_API}/downloadDocument`, {
      fileName,
    });
    return data;
  }
}

export default new DocumentService();
