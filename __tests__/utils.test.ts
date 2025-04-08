import { 
    formatDate, 
    formatDateToInput, 
    slugify, 
    generateUniqueClientNumber, 
    capitalizeFirstLetter,
    formatDateForInput
  } from '@/lib/utils';

  import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
  
  describe("Units tests for utils functions", () => {
  
    test("formatDate should return a date in dd/MM/yyyy format", () => {
      const date = new Date("2025-04-28");
      expect(formatDate(date)).toBe("28/04/2025");
    });
  
    test("formatDateToInput should return a date in yyyy-MM-dd format", () => {
      const date = new Date("2025-04-28");
      expect(formatDateToInput(date)).toBe("2025-04-28");
    });
  
    test("slugify should convert a string into a slug format", () => {
      expect(slugify("Hi Everyone !")).toBe("hi-everyone");
      expect(slugify("    Test  With  Spaces   ")).toBe("test-with-spaces");
      expect(slugify("Work & Client")).toBe("work-client");
    });
  
    test("generateUniqueClientNumber should return a unique client number", () => {
      const clientNumber1 = generateUniqueClientNumber();
      const clientNumber2 = generateUniqueClientNumber();
      expect(clientNumber1).not.toBe(clientNumber2);
      expect(clientNumber1).toMatch(/^CL-\d{6}$/);
    });
  
    test("capitalizeFirstLetter should capitalize the first letter", () => {
      expect(capitalizeFirstLetter("bonjour")).toBe("Bonjour");
      expect(capitalizeFirstLetter("test")).toBe("Test");
      expect(capitalizeFirstLetter("a")).toBe("A");
    });
  
    test("formatDateForInput should return a date in yyyy-MM-dd format", () => {
      expect(formatDateForInput("2024-04-28")).toBe("2024-04-28");
      expect(formatDateForInput(null)).toBe("");
    });
  
  });
  