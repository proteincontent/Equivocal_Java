import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class TestJdbcConnection {
    public static void main(String[] args) {
        String url = envOrDefault(
                "SPRING_DATASOURCE_URL",
                "jdbc:mysql://localhost:3306/equivocal?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
        );
        String user = envOrDefault("SPRING_DATASOURCE_USERNAME", "root");
        String password = envOrDefault("SPRING_DATASOURCE_PASSWORD", "");

        System.out.println("Connecting to database...");
        System.out.println("URL: " + url);
        System.out.println("User: " + user);

        try (Connection conn = DriverManager.getConnection(url, user, password)) {
            if (conn != null) {
                System.out.println("Connected to the database!");
                System.out.println("Database Product Name: " + conn.getMetaData().getDatabaseProductName());
                System.out.println("Database Product Version: " + conn.getMetaData().getDatabaseProductVersion());
            } else {
                System.out.println("Failed to make connection!");
            }
        } catch (SQLException e) {
            System.err.format("SQL State: %s\n%s", e.getSQLState(), e.getMessage());
            e.printStackTrace();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private static String envOrDefault(String key, String defaultValue) {
        String value = System.getenv(key);
        return value != null ? value : defaultValue;
    }
}
