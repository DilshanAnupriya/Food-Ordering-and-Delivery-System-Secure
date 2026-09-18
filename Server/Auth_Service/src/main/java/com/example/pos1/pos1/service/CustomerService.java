package com.example.pos1.pos1.service;

import com.example.pos1.pos1.dto.request.CustomerDto;
import com.example.pos1.pos1.dto.response.CustomerResponseDto;
import com.example.pos1.pos1.dto.response.paginate.CustomerResponsePaginatedDto;

public interface CustomerService {
    public void customerSave(CustomerDto dto);
    public void customerUpdate(CustomerDto dto,String id );
    public CustomerResponseDto customerFindById(String id);
    public void customerDeleteById(String id);
    public CustomerResponsePaginatedDto FindAllCustomer(String searchText, int page, int size);

}
