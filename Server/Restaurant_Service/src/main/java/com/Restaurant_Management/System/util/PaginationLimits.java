package com.Restaurant_Management.System.util;

import com.Restaurant_Management.System.exception.BadRequestException;

public final class PaginationLimits {
    public static final int MAX_PAGE_SIZE = 100;

    private PaginationLimits() {}

    public static void validate(int page, int size) {
        if (page < 0 || size < 1 || size > MAX_PAGE_SIZE) {
            throw new BadRequestException("Page must be non-negative and size must be between 1 and " + MAX_PAGE_SIZE);
        }
    }
}
