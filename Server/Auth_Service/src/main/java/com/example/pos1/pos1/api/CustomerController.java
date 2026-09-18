package com.example.pos1.pos1.api;


import com.example.pos1.pos1.dto.request.CustomerDto;
import com.example.pos1.pos1.service.CustomerService;
import com.example.pos1.pos1.util.StandardResponseDto;
import lombok.RequiredArgsConstructor;
import org.apache.coyote.Response;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ROLE_ADMIN','ROLE_USER')")
    public ResponseEntity<StandardResponseDto> addCustomer(
            @RequestBody CustomerDto dto
    ) {
        customerService.customerSave(dto);
        return new ResponseEntity<>(
                StandardResponseDto.builder()
                        .code(201)
                        .message("Customer created")
                        .data(null)
                        .build(),
                HttpStatus.CREATED
        ) ;
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN')")
    public ResponseEntity<StandardResponseDto> getCustomer(
            @PathVariable("id") String CId) {
        return new ResponseEntity<>(
                StandardResponseDto.builder()
                        .code(200)
                        .message("Customer dat")
                        .data(customerService.customerFindById(CId))
                        .build(),
                HttpStatus.OK
        ) ;
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN','ROLE_USER')")
    public ResponseEntity<StandardResponseDto> updateCustomer(
            @PathVariable("id") String CId,
            @RequestBody CustomerDto dto
    ) {
        customerService.customerUpdate(dto,CId);
        return new ResponseEntity<>(
                StandardResponseDto.builder()
                        .code(201)
                        .message("Customer updated")
                        .data(null)
                        .build(),
                HttpStatus.CREATED
        ) ;
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN')")
    public ResponseEntity<StandardResponseDto> deleteCustomer(@PathVariable("id") String CId
    ) {
        customerService.customerDeleteById(CId);
        return new ResponseEntity<>(
                StandardResponseDto.builder()
                        .code(204)
                        .message("Customer deleted")
                        .data(null)
                        .build(),
                HttpStatus.NO_CONTENT
        ) ;
    }

    @GetMapping("/visitor/list")
    public ResponseEntity<StandardResponseDto> getCustomer(
            @RequestParam String searchText,
            @RequestParam int page,
            @RequestParam int size
    ) {
        return new ResponseEntity<>(
                StandardResponseDto.builder()
                        .code(201)
                        .message("Customer list")
                        .data(customerService.FindAllCustomer(searchText,page,size))
                        .build(),
                HttpStatus.OK
        ) ;
    }


}
