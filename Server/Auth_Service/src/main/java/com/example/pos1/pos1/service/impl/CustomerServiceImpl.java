package com.example.pos1.pos1.service.impl;

import com.example.pos1.pos1.dto.request.CustomerDto;
import com.example.pos1.pos1.dto.response.CustomerResponseDto;
import com.example.pos1.pos1.dto.response.paginate.CustomerResponsePaginatedDto;
import com.example.pos1.pos1.entity.Customer;
import com.example.pos1.pos1.exception.EntryNotFoundException;
import com.example.pos1.pos1.repo.CustomerRepo;
import com.example.pos1.pos1.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepo customerRepo;

    @Override
    public void customerSave(CustomerDto dto) {
        customerRepo.save(toCustomer(dto));
    }

    @Override
    public void customerUpdate(CustomerDto dto, String id) {
      Customer customer =  customerRepo.findById(id).orElseThrow(()->new EntryNotFoundException("Customer not found"));

      customer.setName(dto.getName());
      customer.setAddress(dto.getAddress());
      customer.setSalary(dto.getSalary());

      customerRepo.save(customer);

    }

    @Override
    public CustomerResponseDto customerFindById(String id) {
        return toCustomerResponseDto(
                customerRepo.findById(id).orElseThrow(()->new EntryNotFoundException("Customer not found"))
        );

    }

    @Override
    public void customerDeleteById(String id) {
        customerRepo.deleteById(id);
    }

    @Override
    public CustomerResponsePaginatedDto FindAllCustomer(String searchText, int page, int size) {
        return CustomerResponsePaginatedDto.builder()
                .dataCount(customerRepo.countAllCustomers(searchText))
                .dataList(customerRepo.searchAllCustomers(searchText,PageRequest.of(page,size))
                        .stream()
                        .map(this::toCustomerResponseDto)
                        .collect(Collectors.toList()))
                .build();
    }

    private Customer toCustomer(CustomerDto dto) {
        if (dto == null) throw new RuntimeException("Null CustomerDto");
        return Customer.builder()
                .id(UUID.randomUUID().toString())
                .name(dto.getName())
                .address(dto.getAddress())
                .salary(dto.getSalary())
                .build();
    }

    private CustomerResponseDto toCustomerResponseDto(Customer customer) {
        if (customer == null) throw new RuntimeException("Null CustomerDto");
        return CustomerResponseDto.builder()
                .id(customer.getId())
                .name(customer.getName())
                .address(customer.getAddress())
                .salary(customer.getSalary())
                .build();
    }

}
