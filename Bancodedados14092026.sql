-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: doalize
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.32-MariaDB

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

--
-- Table structure for table `chats`
--

DROP TABLE IF EXISTS `chats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chats` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_one_id` int(11) NOT NULL,
  `user_two_id` int(11) NOT NULL,
  `last_message` text DEFAULT NULL,
  `last_message_time` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_one_id` (`user_one_id`),
  KEY `user_two_id` (`user_two_id`),
  CONSTRAINT `chats_ibfk_1` FOREIGN KEY (`user_one_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `chats_ibfk_2` FOREIGN KEY (`user_two_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chats`
--

LOCK TABLES `chats` WRITE;
/*!40000 ALTER TABLE `chats` DISABLE KEYS */;
/*!40000 ALTER TABLE `chats` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `email_change_verifications`
--

DROP TABLE IF EXISTS `email_change_verifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `email_change_verifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `new_email` varchar(160) NOT NULL,
  `code_hash` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `attempts` int(11) NOT NULL DEFAULT 0,
  `used` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `email_change_verifications_user_id_index` (`user_id`),
  KEY `email_change_verifications_new_email_index` (`new_email`),
  KEY `email_change_verifications_user_used_index` (`user_id`,`used`),
  KEY `email_change_verifications_expires_at_index` (`expires_at`),
  CONSTRAINT `email_change_verifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `email_change_verifications`
--

LOCK TABLES `email_change_verifications` WRITE;
/*!40000 ALTER TABLE `email_change_verifications` DISABLE KEYS */;
INSERT INTO `email_change_verifications` VALUES (1,3,'vinisaomtec@gmail.com','$2b$10$tFDbdjJnWumTnkpjoIxr1.3EvgySrTwP7ENcdSDp565V6T6Ks4xwS','2026-09-14 12:29:04',0,0,'2026-09-14 12:19:04');
/*!40000 ALTER TABLE `email_change_verifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sender_id` int(11) NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `message` text DEFAULT NULL,
  `image` text DEFAULT NULL,
  `audio` text DEFAULT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sender_id` (`sender_id`),
  KEY `receiver_id` (`receiver_id`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES (1,3,1,'Oi',NULL,NULL,'2026-05-26 14:10:55'),(2,3,2,'Ola',NULL,NULL,'2026-05-26 14:13:43'),(3,3,1,'Gallo melhor professor',NULL,NULL,'2026-05-26 14:22:18'),(4,3,3,'Ola',NULL,NULL,'2026-06-16 13:19:11'),(5,3,3,'Anotacoes',NULL,NULL,'2026-08-14 14:23:44'),(6,5,3,'Eu conheco um bom limpador de piscina, quer o numero?',NULL,NULL,'2026-08-26 16:57:38'),(7,5,3,'teste',NULL,NULL,'2026-08-26 17:17:06'),(8,5,3,'ola',NULL,NULL,'2026-08-26 17:17:18'),(9,5,3,'testando',NULL,NULL,'2026-08-26 17:17:24'),(10,5,3,'ola',NULL,NULL,'2026-08-26 17:18:05'),(11,3,1,'Oi Gallo',NULL,NULL,'2026-09-14 12:31:47');
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_verifications`
--

DROP TABLE IF EXISTS `password_verifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_verifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `code_hash` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `attempts` int(11) NOT NULL DEFAULT 0,
  `used` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `password_verifications_user_id_index` (`user_id`),
  KEY `password_verifications_user_used_index` (`user_id`,`used`),
  KEY `password_verifications_created_at_index` (`created_at`),
  CONSTRAINT `password_verifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_verifications`
--

LOCK TABLES `password_verifications` WRITE;
/*!40000 ALTER TABLE `password_verifications` DISABLE KEYS */;
INSERT INTO `password_verifications` VALUES (6,5,'$2b$10$Iv9xL5zM3zovGRJ.qNc/M.NX.sQDeOsAdX5EYua6RD.DyJ5iasnwO','2026-08-26 17:08:30',0,1,'2026-08-26 16:58:30'),(7,3,'$2b$10$.TmntLvFAi26iKJM0s.NZurjSV2/rJcqMSYA9AuBzxKscviO.Gg9G','2026-09-14 12:15:34',0,1,'2026-09-14 12:05:34');
/*!40000 ALTER TABLE `password_verifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `post_promotions`
--

DROP TABLE IF EXISTS `post_promotions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `post_promotions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `post_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `post_promotions_post_user_unique` (`post_id`,`user_id`),
  KEY `post_promotions_post_id_index` (`post_id`),
  KEY `post_promotions_user_id_index` (`user_id`),
  CONSTRAINT `post_promotions_ibfk_23` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `post_promotions_ibfk_24` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `post_promotions`
--

LOCK TABLES `post_promotions` WRITE;
/*!40000 ALTER TABLE `post_promotions` DISABLE KEYS */;
INSERT INTO `post_promotions` VALUES (1,9,5,'2026-08-26 17:21:38'),(2,8,5,'2026-08-26 17:21:48'),(3,9,4,'2026-08-26 17:25:43'),(4,7,3,'2026-09-14 12:33:57'),(6,5,3,'2026-09-14 12:34:53');
/*!40000 ALTER TABLE `post_promotions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `posts`
--

DROP TABLE IF EXISTS `posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `posts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `description` text NOT NULL,
  `images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`images`)),
  `promoted` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL,
  `summary` varchar(160) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `posts`
--

LOCK TABLES `posts` WRITE;
/*!40000 ALTER TABLE `posts` DISABLE KEYS */;
INSERT INTO `posts` VALUES (1,3,'Ola, preciso de alimentos, roupas, medicamentos, basicamente qualquer coisa','[]',0,'2026-05-26 14:38:34',NULL),(2,3,'Preciso de doacoes para melhorar minha casinha linda','[\"file:///data/user/0/host.exp.exponent/cache/ImagePicker/e2235f5a-7855-4784-a141-23aeee05f879.jpeg\"]',1,'2026-06-10 13:39:43',NULL),(3,3,'Me ajude, sou analfabeto e pobre','[\"file:///data/user/0/host.exp.exponent/cache/ImagePicker/fac20d79-9550-4102-9181-2b0a1e1a2e7a.jpeg\"]',0,'2026-06-16 13:53:59',NULL),(4,3,'Esta e minha casa e queria uma casa sem goteiras e onde nao passe frio','[\"file:///data/user/0/host.exp.exponent/cache/ImagePicker/130a141f-bb72-4ffc-98b0-1420baf051b5.jpeg\"]',1,'2026-06-16 14:10:46',NULL),(5,3,'Tenho piscina em casa e preciso de alguem para limpar','[\"/uploads/posts/1786717386156-b12bab136021112eea5460396fea2994.jpeg\"]',1,'2026-08-14 14:23:06',NULL),(6,3,'Preciso de alimento','[\"/uploads/posts/1787235740424-cff3cc8e529cd1fc0190721967488c27.jpeg\",\"/uploads/posts/1787235741249-d8fda8fccd9a9dac43c2c46cd6fc02b0.jpeg\"]',0,'2026-08-20 14:22:21',NULL),(7,3,'Tenho 73 anos, fui alcolatra, e sou acumulador, nao consigo trabalhar pois tenho problema na coluna','[\"/uploads/posts/1787238341624-c86581b0b56d132ed9604119956865e3.jpg\"]',1,'2026-08-20 15:05:42','Preciso de ajuda'),(8,3,'TestandoTestandoTestandoTestandoTestandoTestandoTestandoTestando','[\"/uploads/posts/1787238388794-7263a0de452527adf9bc38a9741e7a46.jpg\",\"/uploads/posts/1787238389352-e50e034a1777fa2f3722d88e444f54ee.jpg\",\"/uploads/posts/1787238390187-4f4cdec063992c19c0a037d4002353cd.jpg\"]',1,'2026-08-20 15:06:30','Testando'),(9,5,'Olhem minha nova ferrari, estou completamente bravo pq na loja nao tinha na cor preta, somente na cor vermelha, que vergonha de pais','[\"/uploads/posts/1787763141917-f80392271617fdfc24a8c9f6a674c5f5.jpg\",\"/uploads/posts/1787763142679-b1d01baaef1a1360396e067a04fd3360.jpg\",\"/uploads/posts/1787763143728-5d4b3a9ee437f73502fb18a3073bace8.jpg\"]',1,'2026-08-26 16:52:24','Compra nova');
/*!40000 ALTER TABLE `posts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `two_factor_verifications`
--

DROP TABLE IF EXISTS `two_factor_verifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `two_factor_verifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `purpose` varchar(20) NOT NULL,
  `code_hash` varchar(255) NOT NULL,
  `challenge_token_hash` varchar(255) DEFAULT NULL,
  `expires_at` datetime NOT NULL,
  `attempts` int(11) NOT NULL DEFAULT 0,
  `used` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `two_factor_user_index` (`user_id`),
  KEY `two_factor_user_purpose_index` (`user_id`,`purpose`),
  KEY `two_factor_user_used_index` (`user_id`,`used`),
  KEY `two_factor_challenge_index` (`challenge_token_hash`),
  KEY `two_factor_expiration_index` (`expires_at`),
  CONSTRAINT `two_factor_verifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `two_factor_verifications`
--

LOCK TABLES `two_factor_verifications` WRITE;
/*!40000 ALTER TABLE `two_factor_verifications` DISABLE KEYS */;
INSERT INTO `two_factor_verifications` VALUES (4,3,'enable','$2b$10$gmurrjoKZbpg6DgGfP6I4.YB8If7BwGLIbiiWMXVzBrEXAUE4ECZm',NULL,'2026-09-14 12:36:03',0,1,'2026-09-14 12:26:03'),(5,3,'login','$2b$10$KUvUiVgd22OidBRcQnm.oe8kSPOz5tY7djvZTNPVfI6KXMtUvg.5y','82a3d67ba32f0256d8363a418f8b5b3fa4549b408ef5317305ccd14f56ba51b9','2026-09-14 12:38:41',0,1,'2026-09-14 12:28:41');
/*!40000 ALTER TABLE `two_factor_verifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(120) NOT NULL,
  `email` varchar(160) NOT NULL,
  `password` varchar(255) NOT NULL,
  `photo` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `location` varchar(160) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `two_factor_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `terms_accepted_at` datetime DEFAULT NULL,
  `terms_version` varchar(30) DEFAULT NULL,
  `privacy_version` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `email_2` (`email`),
  UNIQUE KEY `email_3` (`email`),
  UNIQUE KEY `email_4` (`email`),
  UNIQUE KEY `email_5` (`email`),
  UNIQUE KEY `email_6` (`email`),
  UNIQUE KEY `email_7` (`email`),
  UNIQUE KEY `email_8` (`email`),
  UNIQUE KEY `email_9` (`email`),
  UNIQUE KEY `email_10` (`email`),
  UNIQUE KEY `email_11` (`email`),
  UNIQUE KEY `email_12` (`email`),
  UNIQUE KEY `email_13` (`email`),
  UNIQUE KEY `email_14` (`email`),
  UNIQUE KEY `email_15` (`email`),
  UNIQUE KEY `email_16` (`email`),
  UNIQUE KEY `email_17` (`email`),
  UNIQUE KEY `email_18` (`email`),
  UNIQUE KEY `email_19` (`email`),
  UNIQUE KEY `email_20` (`email`),
  UNIQUE KEY `email_21` (`email`),
  UNIQUE KEY `email_22` (`email`),
  UNIQUE KEY `email_23` (`email`),
  UNIQUE KEY `email_24` (`email`),
  UNIQUE KEY `email_25` (`email`),
  UNIQUE KEY `email_26` (`email`),
  UNIQUE KEY `email_27` (`email`),
  UNIQUE KEY `email_28` (`email`),
  UNIQUE KEY `email_29` (`email`),
  UNIQUE KEY `email_30` (`email`),
  UNIQUE KEY `email_31` (`email`),
  UNIQUE KEY `email_32` (`email`),
  UNIQUE KEY `email_33` (`email`),
  UNIQUE KEY `email_34` (`email`),
  UNIQUE KEY `email_35` (`email`),
  UNIQUE KEY `users_email_index` (`email`),
  KEY `users_two_factor_enabled_index` (`two_factor_enabled`),
  KEY `users_terms_version_index` (`terms_version`),
  KEY `users_privacy_version_index` (`privacy_version`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Etec','etec@gmail.com','$2b$10$Rw6q0NB1hYyNra0RNOXxd.3D1AsdcM0zK7EVgM4KjEvWXzcPGbYyC',NULL,NULL,NULL,'2026-05-19 14:00:26',0,NULL,NULL,NULL),(2,'Lucas ','lucasjr@gmail.com','$2b$10$pmTM7NOEALJ7GWNWMN4WG.SxeCGJAp1yEr0sIMwj96jXiaZkeI1bW',NULL,NULL,NULL,'2026-05-19 14:12:47',0,NULL,NULL,NULL),(3,'anthony rodrigues da silva','anthonyserrano894@gmail.com','$2b$10$pbVI2t/gjk1EM1Rr4QAmcekcaO10dbVK9OCIKEjjZxMrCArewn5mS','/uploads/users/1786717331270-b6cc1e968fed202a65502ca213256b57.jpeg','Tenho 18 anos e estou no ensino medio','Barra Bonita sp','2026-05-20 14:30:06',1,NULL,NULL,NULL),(4,'Vinicius Godoy Martins','Viniciusgodoy.martins2@gmail.com','$2b$10$6IBA6xPCOZx4PLjYnTiScOOSj.y5hIkLPbQGa0O8p51PW4wK/7DmG','/uploads/usuarioimage.png',NULL,NULL,'2026-08-26 16:40:01',0,NULL,NULL,NULL),(5,'Rhuan P','roii265p@gmail.com','$2b$10$k6015JXTVpI6mEjkztg53e5fHzhUlRmHtWssimB1gaWnWI2O09UeS','/uploads/users/1787762906273-9796a4af097ecbda2eb18ff5ffad0588.jpeg','Dev app','Barra Bonita','2026-08-26 16:42:31',0,NULL,NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-14  9:39:14
