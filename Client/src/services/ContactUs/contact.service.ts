import axios from 'axios';

interface ContactFormData {
    name: string;
    email: string;
    comment: string;
}

interface ContactMessage extends ContactFormData {
    id: string;
}

export const ContactService = {
    submitContactForm: async (formData: ContactFormData) => {
        try {
            const response = await axios.post('http://localhost:8082/api/v1/contactus/create', formData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getAllMessages: async () => {
        try {
            const response = await axios.get('http://localhost:8082/api/v1/contactus/fetch/all');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getMessage: async (id: string) => {
        try {
            const response = await axios.get(`http://localhost:8082/api/v1/contactus/fetch/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    deleteMessage: async (id: string) => {
        try {
            await axios.delete(`http://localhost:8082/api/v1/contactus/delete/${id}`);
        } catch (error) {
            throw error;
        }
    }
};