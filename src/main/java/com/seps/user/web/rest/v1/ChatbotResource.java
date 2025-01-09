package com.seps.user.web.rest.v1;

import com.seps.user.service.ChatbotService;
import com.seps.user.service.dto.ChatbotQueryDTO;
import com.seps.user.service.dto.RasaResponseDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

@RestController
@RequestMapping("/api/v1/chatbot")
@Tag(name = "Chatbot", description = "Operations related to the chatbot service")
public class ChatbotResource {

    private final ChatbotService chatbotService;

    public ChatbotResource(ChatbotService chatbotService) {
        this.chatbotService = chatbotService;
    }

    /**
     * Handles a chatbot query and returns the response from Rasa.
     *
     * @param queryDTO the chatbot query data transfer object containing the user query and session information.
     * @return a Flux of RasaResponseDTO containing the chatbot's response.
     */
    @Operation(
        summary = "Send a query to the chatbot",
        description = "This endpoint sends a user query to the chatbot and returns the response from the Rasa server.",
        tags = {"Chatbot"}
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Successfully processed the query",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = RasaResponseDTO.class))
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid request body",
            content = @Content(mediaType = "application/json")
        ),
        @ApiResponse(
            responseCode = "500",
            description = "Internal server error",
            content = @Content(mediaType = "application/json")
        )
    })
    @PostMapping("/query")
    public ResponseEntity<Flux<Object>> queryChatbot(@RequestBody ChatbotQueryDTO queryDTO) {
        Flux<Object> response = chatbotService.handleQuery(queryDTO);
        return ResponseEntity.ok(response);
    }

}
