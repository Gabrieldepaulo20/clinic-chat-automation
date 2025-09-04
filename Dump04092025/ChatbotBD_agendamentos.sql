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
-- Table structure for table `agendamentos`
--

DROP TABLE IF EXISTS `agendamentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `agendamentos` (
  `id_agendamento` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `id_profissional` int NOT NULL,
  `data_agendamento` datetime NOT NULL,
  `status_agendamento` enum('confirmado','pendente','cancelado') DEFAULT 'pendente',
  `tipo_consulta` varchar(100) DEFAULT NULL,
  `observacoes` text,
  `data_criacao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `data_atualizacao` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_agendamento`),
  KEY `id_usuario` (`id_usuario`),
  KEY `id_profissional` (`id_profissional`),
  CONSTRAINT `agendamentos_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `agendamentos_ibfk_2` FOREIGN KEY (`id_profissional`) REFERENCES `profissionais` (`id_profissional`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `agendamentos`
--

LOCK TABLES `agendamentos` WRITE;
/*!40000 ALTER TABLE `agendamentos` DISABLE KEYS */;
INSERT INTO `agendamentos` VALUES (1,67,1,'2025-06-22 08:00:00','pendente','Avaliação','Paciente novo, primeira avaliação.','2025-05-28 23:15:51','2025-05-28 23:15:51'),(2,68,1,'2025-06-24 08:30:00','pendente','Procedimento','voltando para fazer limpeza bucal','2025-05-28 23:15:51','2025-05-28 23:15:51'),(3,68,1,'2025-06-07 00:00:00','pendente','odonto','vou consultar','2025-06-05 15:34:32','2025-06-05 15:34:32'),(4,68,1,'2025-06-07 08:15:00','pendente','odonto','consulta agendada com a dayse','2025-06-05 16:27:09','2025-06-05 16:27:09'),(5,68,1,'2025-06-04 10:00:00','pendente','odonto','consulta com a dayse para reanalize','2025-06-05 17:45:16','2025-06-05 17:45:16'),(6,68,1,'2025-06-06 09:00:00','pendente','odonto','consultaaa','2025-06-05 17:46:06','2025-06-05 17:46:06'),(7,74,1,'2025-06-05 08:30:00','pendente','odonto','TESTE','2025-06-05 18:19:20','2025-06-05 18:19:20'),(8,68,1,'2025-09-05 09:00:00','pendente','odonto','jbnkkj','2025-06-05 23:34:49','2025-06-05 23:34:49'),(9,76,1,'2025-07-17 11:30:00','pendente','odonto','','2025-06-05 23:39:23','2025-06-05 23:39:23'),(10,68,1,'2025-06-20 10:30:00','pendente','odonto','Consulta reagendamento','2025-06-06 00:07:32','2025-06-06 00:07:32'),(11,75,1,'2025-06-06 12:45:00','pendente','odonto','Consulta','2025-06-06 00:24:33','2025-06-06 00:24:33'),(12,68,1,'2025-06-12 10:30:00','pendente','odonto','gabriel','2025-06-06 02:32:43','2025-06-06 02:32:43'),(13,75,1,'2025-07-09 08:15:00','pendente','odonto','','2025-06-07 21:39:30','2025-06-07 21:39:30'),(14,75,1,'2025-06-03 10:30:00','pendente','odonto','','2025-06-09 19:19:48','2025-06-09 19:19:48');
/*!40000 ALTER TABLE `agendamentos` ENABLE KEYS */;
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

-- Dump completed on 2025-09-04  0:59:15
