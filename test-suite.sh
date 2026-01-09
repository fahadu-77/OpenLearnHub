#!/bin/bash

echo "=== OpenLearnHub Comprehensive Test Suite ==="
echo ""

# Colors
GREEN='\033[0.32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Function to test endpoint
test_endpoint() {
    local name=$1
    local url=$2
    local expected_code=$3
    
    echo -n "Testing $name... "
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$response" = "$expected_code" ]; then
        echo -e "${GREEN}✓ PASSED${NC} (HTTP $response)"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC} (Expected $expected_code, got $response)"
        ((FAILED++))
    fi
}

echo "1. Backend Health Checks"
echo "------------------------"
test_endpoint "Server Running" "http://localhost:3000/api/courses" "200"
test_endpoint "Get All Courses" "http://localhost:3000/api/courses" "200"
test_endpoint "Filter by Category" "http://localhost:3000/api/courses?category=Development" "200"
test_endpoint "Filter by Instructor" "http://localhost:3000/api/courses?instructor=69411213011d138c12a2cb4b" "200"

echo ""
echo "2. Frontend Health Checks"
echo "------------------------"
test_endpoint "Homepage" "http://localhost:5173/" "200"
test_endpoint "Login Page" "http://localhost:5173/login" "200"
test_endpoint "Register Page" "http://localhost:5173/register" "200"
test_endpoint "Dashboard" "http://localhost:5173/dashboard" "200"

echo ""
echo "3. Data Integrity Checks"
echo "------------------------"

# Check if courses have lessons
echo -n "Checking courses have lessons... "
courses_with_lessons=$(curl -s "http://localhost:3000/api/courses" | grep -o '"lessons":\[' | wc -l)
if [ "$courses_with_lessons" -gt 0 ]; then
    echo -e "${GREEN}✓ PASSED${NC} ($courses_with_lessons courses found)"
    ((PASSED++))
else
    echo -e "${RED}✗ FAILED${NC}"
    ((FAILED++))
fi

# Check if latest courses have transcripts
echo -n "Checking for transcript data... "
transcript_check=$(curl -s "http://localhost:3000/api/courses/6953993921a49a3938da24ca" | grep -o '"transcript":"Welcome' | wc -l)
if [ "$transcript_check" -gt 0 ]; then
    echo -e "${GREEN}✓ PASSED${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ FAILED${NC}"
    ((FAILED++))
fi

echo ""
echo "=== Test Summary ==="
echo "Passed: $PASSED"
echo "Failed: $FAILED"
echo ""

if [ "$FAILED" -eq 0 ]; then
    echo -e "${GREEN}All tests passed! ✓${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed. Please review.${NC}"
    exit 1
fi
