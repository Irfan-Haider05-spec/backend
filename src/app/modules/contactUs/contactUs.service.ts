

import { IContactUs } from "./contactUs.interface";
import { ContactUs, IContactUsDocument } from "./contactUs.model";
import QueryBuilder from "../../../utils/queryBuilder";

const createContact = async (data: IContactUs): Promise<IContactUsDocument> => {
  const contact = new ContactUs(data);
  return await contact.save();
};

const getAllContacts = async (query: Record<string, any>) => {
  const modelQuery = ContactUs.find();
  
  const contactsQuery = new QueryBuilder(modelQuery, query)
    .search(['firstName', 'email', 'phone', 'message']) 
    .filter()   
    .sort()     
    .paginate() 
    .fields();  

  const data = await contactsQuery.modelQuery;
  const pagination = await contactsQuery.getPaginationInfo();

  return {
    data,
    pagination,
  };
};

export const ContactService = {
  createContact,
  getAllContacts,
};
