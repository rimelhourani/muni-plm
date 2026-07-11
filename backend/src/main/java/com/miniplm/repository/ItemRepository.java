package com.miniplm.repository;

import com.miniplm.model.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ItemRepository extends JpaRepository<Item, UUID> {
    Optional<Item> findByItemId(String itemId);
    boolean existsByItemId(String itemId);
    List<Item> findByNameContainingIgnoreCaseOrItemIdContainingIgnoreCase(String name, String itemId);
}
