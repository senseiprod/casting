package com.example.senseiVoix.helpers;

import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.data.domain.Sort.Order;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

public class Utils {

	private static final String CHARACTERS = "0123456789";
	private static final int CODE_LENGTH = 6;

	// Generic function to convert an Array to Set
	public static <T> Set<T> convertArrayToSet(T array[]) {

		// Create the Set by passing the Array
		// as parameter in the constructor
		Set<T> set = new HashSet<>(Arrays.asList(array));

		// Return the converted Set
		return set;
	}

	public static String TrimIfNotNull(String value) {
		if (value != null) {
			return value.trim();
		}
		return null;
	}

	public static String replaceCharAt(String s, int pos, String c) {
		return s.substring(0, pos) + c + s.substring(s.length() - 1);
	}

	private java.sql.Date convertToDateSQL(LocalDate dateToConvert) {
		return java.sql.Date.valueOf(dateToConvert);
	}

	public static String getHashedUuid(LocalDateTime DateCreation, Long id) {
		UUID uuid = UUID.randomUUID();
		String hash = uuid.toString() + DateCreation + id;
		return DigestUtils.sha256Hex(hash);
	}

	public static boolean isTimeReset(Date date, Integer dureeTentatives) {
		return date == null || ((new Date()).getTime() - date.getTime()) > dureeTentatives * 1000;
	}

	public static Integer getRandomOtp() {

		return 100000 + new Random().nextInt(900000);

	}

	public static String getRandomStringOtp() {

		int leftLimit = 48; // numeral '0'
		int rightLimit = 122; // letter 'z'
		int targetStringLength = 10;
		Random random = new Random();

		String otp = random.ints(leftLimit, rightLimit + 1).filter(i -> (i <= 57 || i >= 65) && (i <= 90 || i >= 97))
				.limit(targetStringLength)
				.collect(StringBuilder::new, StringBuilder::appendCodePoint, StringBuilder::append).toString();

		return otp.toUpperCase();

	}

	public static <T> T getField(T valueToAssign, T defaultValue) {
		Optional<T> checkNull = Optional.ofNullable(valueToAssign);

		return checkNull.isPresent() ? checkNull.get() : defaultValue;

	}

	public static void generateResponse(Map<String, Object> response, long totalItems, int page, int size) {
		response.put("currentPage", totalItems == 0 ? 0 : 1 + page);
		response.put("totalItems", totalItems);
		response.put("totalPages", totalItems == 0 ? 0 : 1 + totalItems / (size));
	}

	public static Direction getSortDirection(String direction) {
		if (direction.equals("asc")) {
			return Direction.ASC;
		} else if (direction.equals("desc")) {
			return Direction.DESC;
		}

		return Direction.ASC;
	}

	public static List<Order> getListOrderBySort(String[] sort) {

		List<Order> orders = new ArrayList<Order>();

		if (sort[0].contains(",")) {
			for (String sortOrder : sort) {
				String[] _sort = sortOrder.split(",");
				orders.add(new Order(getSortDirection(_sort[1]), _sort[0]));
			}
		} else {
			orders.add(new Order(getSortDirection(sort[1]), sort[0]));
		}

		return orders;
	}

	public static String converteDateToString(LocalDateTime localDateTime) {
		String valueReturn = null;

		if (localDateTime != null) {

			DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

			valueReturn = localDateTime.format(formatter);
		}

		return valueReturn;

	}


	public static String generateHash() {

		SecureRandom random = new SecureRandom();
		StringBuilder code = new StringBuilder();
		String newCode = new String();
		for (int i = 0; i < CODE_LENGTH; i++) {
			int randomIndex = random.nextInt(CHARACTERS.length());
			char randomChar = CHARACTERS.charAt(randomIndex);
			code.append(randomChar);
		}

		return newCode = addCharacterBetween(code.toString(), '-', 3);
	}

	public static String addCharacterBetween(String input, char character, int groupSize) {
		StringBuilder result = new StringBuilder();

		for (int i = 0; i < input.length(); i++) {
			result.append(input.charAt(i));

			if ((i + 1) % groupSize == 0 && i < input.length() - 1) {
				result.append(character);
			}
		}
		return result.toString();
	}

}
