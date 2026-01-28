import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class TestJdbcConnection {
    public static void main(String[] args) {
        String url = "jdbc:mysql://gateway01.ap-northeast-1.prod.aws.tidbcloud.com:4000/test?useSSL=true&requireSSL=true&verifyServerCertificate=false&allowPublicKeyRetrieval=true&connectTimeout=30000&socketTimeout=60000&autoReconnect=true&failOverReadOnly=false&maxReconnects=3&tcpKeepAlive=true";
        String user = "gdjqzvhsjk1agjw.root";
        String password = "0upXu0riDOLiJPCk";

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
}