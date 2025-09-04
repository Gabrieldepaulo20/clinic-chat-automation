CREATE DATABASE  IF NOT EXISTS `ChatbotBD` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `ChatbotBD`;
-- MySQL dump 10.13  Distrib 8.0.43, for macos15 (arm64)
--
-- Host: chatbotwhatsapp.cf8sa2ussbtl.us-east-1.rds.amazonaws.com    Database: ChatbotBD
-- ------------------------------------------------------
-- Server version	8.0.40

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '';

--
-- Table structure for table `mensagens`
--

DROP TABLE IF EXISTS `mensagens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mensagens` (
  `id_mensagens` int NOT NULL AUTO_INCREMENT,
  `nome_mensagem` varchar(100) DEFAULT NULL,
  `tipo` varchar(50) DEFAULT NULL,
  `proxima_mensagem_id` int DEFAULT NULL,
  `caminho` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`id_mensagens`),
  KEY `proxima_mensagem_id` (`proxima_mensagem_id`),
  CONSTRAINT `mensagens_ibfk_1` FOREIGN KEY (`proxima_mensagem_id`) REFERENCES `mensagens` (`id_mensagens`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mensagens`
--

LOCK TABLES `mensagens` WRITE;
/*!40000 ALTER TABLE `mensagens` DISABLE KEYS */;
INSERT INTO `mensagens` VALUES (-99,'selectOneOptions','text',NULL,'Outros'),(-98,'wrongCPF','text',NULL,'Outros'),(1,'welcomeButton','list',NULL,'Welcome'),(2,'verifyRegisterAgendamentos','text',3,'VerificarAgendamentos'),(3,'nextAppointments','text',NULL,'VerificarAgendamentos'),(4,'talkAttendant','text',NULL,'FalarComAtendente'),(5,'verifyRegisterCAC','text',6,'CancelarAgendarConsultas'),(6,'newAppointment?','button',NULL,'CancelarAgendarConsultas'),(7,'NewScheduledAppointments','button',NULL,'CancelarAgendarConsultas'),(8,'remarcada','text',NULL,'CancelarAgendarConsultas'),(9,'cancelada','text',NULL,'CancelarAgendarConsultas'),(10,'completeName','text',11,'Cadastro'),(11,'dentalPlan','text',12,'Cadastro'),(12,'indication','text',13,'Cadastro'),(13,'validation','text',NULL,'Cadastro'),(14,'verifyRegisterConsulta','text',15,'Agendamento'),(15,'acessCalendar','text',NULL,'Agendamento'),(16,'plano_sim','text',12,'Cadastro'),(17,'indicacao_sim','text',13,'Cadastro'),(18,'CancelScheduledAppointments','text',NULL,'CancelarAgendarConsultas');
/*!40000 ALTER TABLE `mensagens` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-04  0:59:07
